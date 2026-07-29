import { pollSource, readingsToPrompt, type SourceReading } from '../connectors'
import { db } from '../db'
import { HOUSE_RULES } from '../guardrails'
import { addUsage, arraySchema, objectSchema, think } from '../llm'
import { outOfTime, budgetCheck } from '../guardrails'
import type { Project, ProjectSource } from '../types'
import type { PhaseResult, RunContext } from './context'

/**
 * The Scout.
 *
 * Goes and looks. Reads every source attached to every active project and
 * turns what it finds into observations — short, evidence-bearing facts.
 * It does not assess, rank or recommend; that comes next.
 */

const SYSTEM = `
You are the Scout on an overnight project-management crew.

Your only job is to turn raw source readings into clean observations about a
project. An observation is a single fact, stated plainly, that someone could
verify from the reading you were given.

${HOUSE_RULES}

Classify each observation:
- progress: something moved forward
- risk:     something that could go wrong but hasn't yet
- blocker:  something is actively stopping progress
- idle:     nothing has happened, and that is itself worth noting
- signal:   context that matters but fits none of the above

Never write an observation the reading does not support. Three real
observations beat ten padded ones. If a source could not be read, say exactly
that and nothing more.
`.trim()

const OBSERVATION_SCHEMA = objectSchema({
  observations: arraySchema(
    objectSchema({
      kind: { type: 'string', enum: ['progress', 'risk', 'blocker', 'signal', 'idle'] },
      title: { type: 'string', description: 'One line, under 100 characters.' },
      detail: { type: 'string', description: 'One or two sentences of specifics.' },
      confidence: { type: 'number', description: '0 to 1. How sure the reading makes you.' },
    }),
  ),
  activity_summary: {
    type: 'string',
    description: 'One sentence: what happened on this project recently.',
  },
})

interface ScoutOutput {
  observations: Array<{
    kind: 'progress' | 'risk' | 'blocker' | 'signal' | 'idle'
    title: string
    detail: string
    confidence: number
  }>
  activity_summary: string
}

export async function runScout(
  ctx: RunContext,
  projects: Project[],
  alreadyDone: string[],
): Promise<PhaseResult> {
  const completed: string[] = []
  const todo = projects.filter((p) => !alreadyDone.includes(p.id))

  ctx.log(`Scout: ${todo.length} project${todo.length === 1 ? '' : 's'} to look at.`)

  for (const project of todo) {
    if (outOfTime(ctx.budget)) {
      return {
        completed,
        incomplete: true,
        note: `Scout paused after ${completed.length} projects — out of time for this invocation.`,
      }
    }
    const budget = budgetCheck(ctx.budget)
    if (!budget.ok) {
      return { completed, incomplete: true, note: `Scout stopped: ${budget.reason}` }
    }

    const { data: sources } = await db()
      .from('project_sources')
      .select('*')
      .eq('project_id', project.id)
      .eq('enabled', true)

    const readings: SourceReading[] = []
    for (const source of (sources ?? []) as ProjectSource[]) {
      const reading = await pollSource(source)
      readings.push(reading)
      await db()
        .from('project_sources')
        .update({ last_polled_at: new Date().toISOString(), last_error: reading.error })
        .eq('id', source.id)
    }

    const latest = readings
      .map((r) => r.lastActivityAt)
      .filter((d): d is string => Boolean(d))
      .sort()
      .pop()

    const result = await think<ScoutOutput>({
      agent: 'scout',
      system: SYSTEM,
      effort: 'low',
      schema: OBSERVATION_SCHEMA,
      prompt: [
        `Project: ${project.name}`,
        project.goal ? `Its goal: ${project.goal}` : 'No goal has been recorded for it.',
        project.summary ? `Background: ${project.summary}` : '',
        '',
        'Readings from its sources:',
        readingsToPrompt(readings),
      ]
        .filter(Boolean)
        .join('\n'),
      dryRunValue: {
        observations: readings.flatMap((r) =>
          r.findings.slice(0, 3).map((f) => ({
            kind: 'signal' as const,
            title: f.slice(0, 100),
            detail: `Recorded verbatim from ${r.source}. Dry run — no model was consulted.`,
            confidence: 0.4,
          })),
        ),
        activity_summary: 'Dry run — sources were read, but nothing was interpreted.',
      },
    })

    ctx.usage = addUsage(ctx.usage, result.usage)
    ctx.budget.spentPennies += result.usage.costPennies

    const rows = result.value.observations.map((o) => ({
      run_id: ctx.runId,
      project_id: project.id,
      source: readings.map((r) => r.source).join(', ') || 'no sources',
      kind: o.kind,
      title: o.title.slice(0, 300),
      detail: o.detail,
      evidence: readings.flatMap((r) => r.evidence).slice(0, 12),
      confidence: Math.min(1, Math.max(0, o.confidence)),
    }))

    if (rows.length > 0) {
      await db().from('observations').insert(rows)
    }

    await db()
      .from('projects')
      .update({
        last_reviewed_at: new Date().toISOString(),
        ...(latest ? { last_activity_at: latest } : {}),
      })
      .eq('id', project.id)

    ctx.log(`  ${project.name}: ${rows.length} observation${rows.length === 1 ? '' : 's'}.`)
    completed.push(project.id)
  }

  return { completed, incomplete: false, note: `Scout reviewed ${completed.length} projects.` }
}
