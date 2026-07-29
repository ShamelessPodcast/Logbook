import { runAnalyst, runOperator, runPlanner, runScout, runScribe } from './agents'
import type { RunContext } from './agents/context'
import { audit, db } from './db'
import { autonomyLevel, limits } from './env'
import { newBudget, outOfTime } from './guardrails'
import { llmAvailable, ZERO_USAGE } from './llm'
import type { Phase, Project, Run, RunCursor, RunTrigger } from './types'

/**
 * Runs the night.
 *
 * The whole thing is built around one awkward fact: serverless functions get
 * killed on a wall clock, and reviewing twenty projects with a frontier model
 * takes longer than that. So a run is a resumable state machine. Each phase
 * records the projects it finished; when the invocation runs low on time it
 * saves the cursor and returns. A later tick picks it up exactly where it
 * stopped. A night is never lost to a timeout — it just takes two or three
 * invocations.
 */

const PHASES: Phase[] = ['scout', 'analyst', 'planner', 'operator', 'scribe']

export interface RunOutcome {
  runId: string
  status: Run['status']
  phase: Phase
  finished: boolean
  log: string[]
  summary: string
}

/** Any run left mid-flight by a previous invocation. */
export async function findResumableRun(): Promise<Run | null> {
  const { data } = await db()
    .from('runs')
    .select('*')
    .eq('status', 'running')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as Run) ?? null
}

async function activeProjects(): Promise<Project[]> {
  const { data } = await db()
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limits.maxProjectsPerRun)
  return (data ?? []) as Project[]
}

export async function startRun(trigger: RunTrigger = 'cron'): Promise<RunOutcome> {
  const mode = llmAvailable() && autonomyLevel() !== 'dry_run' ? 'live' : 'dry_run'

  const { data, error } = await db()
    .from('runs')
    .insert({ trigger, mode, status: 'running', phase: 'scout', cursor: {} })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(`Could not start a run: ${error?.message ?? 'no row returned'}`)
  }

  await audit('orchestrator', 'run.started', data.id, { trigger, mode, autonomy: autonomyLevel() })
  return advance(data as Run)
}

export async function resumeRun(run: Run): Promise<RunOutcome> {
  await db().from('runs').update({ trigger: 'resume' }).eq('id', run.id)
  await audit('orchestrator', 'run.resumed', run.id, { phase: run.phase })
  return advance(run)
}

/** Drives a run forward until it finishes or this invocation runs out of time. */
async function advance(run: Run): Promise<RunOutcome> {
  const log: string[] = []
  const ctx: RunContext = {
    runId: run.id,
    mode: run.mode,
    budget: newBudget(),
    usage: { ...ZERO_USAGE },
    log: (message) => {
      log.push(message)
      console.log(`[nightshift:${run.id.slice(0, 8)}] ${message}`)
    },
  }

  const projects = await activeProjects()
  ctx.log(
    `${projects.length} active project${projects.length === 1 ? '' : 's'}. ` +
      `Mode: ${run.mode}. Autonomy: ${autonomyLevel()}.`,
  )

  let cursor: RunCursor = run.cursor ?? {}
  let phase: Phase = run.phase
  const notes: string[] = []

  try {
    while (phase !== 'done') {
      if (outOfTime(ctx.budget)) {
        await checkpoint(run.id, phase, cursor, ctx)
        return {
          runId: run.id,
          status: 'running',
          phase,
          finished: false,
          log,
          summary: `Paused during ${phase}. A later tick will pick it up.`,
        }
      }

      const done = cursor.done ?? []
      const result = await (async () => {
        switch (phase) {
          case 'scout':
            return runScout(ctx, projects, done)
          case 'analyst':
            return runAnalyst(ctx, projects, done)
          case 'planner':
            return runPlanner(ctx, projects, done)
          case 'operator':
            return runOperator(ctx, done)
          case 'scribe':
            return runScribe(ctx, projects)
          default:
            return { completed: [], incomplete: false, note: '' }
        }
      })()

      notes.push(result.note)

      if (result.incomplete) {
        // Same phase, more projects to go. Save progress and hand back.
        cursor = { ...cursor, done: [...done, ...result.completed] }
        await checkpoint(run.id, phase, cursor, ctx)
        ctx.log(result.note)
        return {
          runId: run.id,
          status: 'running',
          phase,
          finished: false,
          log,
          summary: result.note,
        }
      }

      // Phase complete — reset the per-phase cursor and move on.
      phase = PHASES[PHASES.indexOf(phase) + 1] ?? 'done'
      cursor = { ...cursor, done: [] }
      await checkpoint(run.id, phase, cursor, ctx)
    }

    const summary = notes.filter(Boolean).join(' ')
    await db()
      .from('runs')
      .update({
        status: 'ok',
        phase: 'done',
        finished_at: new Date().toISOString(),
        summary,
        input_tokens: ctx.usage.inputTokens,
        output_tokens: ctx.usage.outputTokens,
        cost_pennies: ctx.usage.costPennies,
      })
      .eq('id', run.id)

    await audit('orchestrator', 'run.finished', run.id, {
      cost_pennies: ctx.usage.costPennies,
      projects: projects.length,
    })

    ctx.log(`Done. Cost this run: ${ctx.usage.costPennies.toFixed(2)}p.`)
    return { runId: run.id, status: 'ok', phase: 'done', finished: true, log, summary }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    ctx.log(`Run failed: ${message}`)
    await db()
      .from('runs')
      .update({
        status: 'failed',
        error: message,
        finished_at: new Date().toISOString(),
        summary: notes.filter(Boolean).join(' '),
        input_tokens: ctx.usage.inputTokens,
        output_tokens: ctx.usage.outputTokens,
        cost_pennies: ctx.usage.costPennies,
      })
      .eq('id', run.id)
    await audit('orchestrator', 'run.failed', run.id, { error: message })
    return {
      runId: run.id,
      status: 'failed',
      phase,
      finished: true,
      log,
      summary: `Run failed: ${message}`,
    }
  }
}

async function checkpoint(
  runId: string,
  phase: Phase,
  cursor: RunCursor,
  ctx: RunContext,
): Promise<void> {
  await db()
    .from('runs')
    .update({
      phase,
      cursor,
      input_tokens: ctx.usage.inputTokens,
      output_tokens: ctx.usage.outputTokens,
      cost_pennies: ctx.usage.costPennies,
    })
    .eq('id', runId)
}

/**
 * Marks abandoned runs as failed so a crashed invocation doesn't leave a run
 * "running" forever and block the next night.
 */
export async function reapStaleRuns(maxAgeMinutes = 90): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60_000).toISOString()
  const { data } = await db()
    .from('runs')
    .update({
      status: 'failed',
      error: `Abandoned — no progress for over ${maxAgeMinutes} minutes.`,
      finished_at: new Date().toISOString(),
    })
    .eq('status', 'running')
    .lt('started_at', cutoff)
    .select('id')
  return (data ?? []).length
}
