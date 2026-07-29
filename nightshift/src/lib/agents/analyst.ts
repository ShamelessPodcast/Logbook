import { db } from '../db'
import { budgetCheck, HOUSE_RULES, outOfTime } from '../guardrails'
import { addUsage, objectSchema, think } from '../llm'
import type { Health, Observation, Project } from '../types'
import type { PhaseResult, RunContext } from './context'

/**
 * The Analyst.
 *
 * Reads tonight's observations against the project's history and answers one
 * question per project: how is this actually going?
 *
 * The important behaviour is that it is willing to say "stalled". A project
 * manager who never reports bad news is worse than none, and a crew that
 * marks everything on-track is decoration.
 */

const SYSTEM = `
You are the Analyst on an overnight project-management crew.

You are given one project, what the Scout observed tonight, and how the
project has looked recently. You decide its health and say why in one
sentence someone can act on.

${HOUSE_RULES}

Health levels, and what each actually means:
- on_track: real, recent movement towards the stated goal.
- at_risk:  moving, but something concrete threatens it — a deadline, a
            dependency, a decision nobody has made.
- stalled:  no meaningful movement for long enough that it needs a nudge.
            A project with no activity is stalled even if nothing is wrong.
- blocked:  progress is impossible until something specific is resolved.
- unknown:  you genuinely cannot tell from what you were given. Use this
            rather than guessing at on_track.

Be honest. Marking a dead project on_track because nothing bad happened is
the single most damaging thing you can do here. Silence is not progress.
`.trim()

const SCHEMA = objectSchema({
  health: {
    type: 'string',
    enum: ['unknown', 'on_track', 'at_risk', 'stalled', 'blocked'],
  },
  health_note: {
    type: 'string',
    description: 'One sentence. Why this health, specifically. Reference the evidence.',
  },
  headline: {
    type: 'string',
    description: 'The single most important thing about this project right now.',
  },
  concerns: {
    type: 'array',
    description: 'Anything that needs attention. Empty if there is genuinely nothing.',
    items: objectSchema({
      title: { type: 'string' },
      detail: { type: 'string' },
      severity: { type: 'string', enum: ['low', 'medium', 'high'] },
    }),
  },
})

interface AnalystOutput {
  health: Health
  health_note: string
  headline: string
  concerns: Array<{ title: string; detail: string; severity: 'low' | 'medium' | 'high' }>
}

/** Days of no activity after which a project is stalled regardless of the model. */
const STALE_AFTER_DAYS = 14

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - Date.parse(iso)) / 86_400_000)
}

export async function runAnalyst(
  ctx: RunContext,
  projects: Project[],
  alreadyDone: string[],
): Promise<PhaseResult> {
  const completed: string[] = []
  const todo = projects.filter((p) => !alreadyDone.includes(p.id))

  ctx.log(`Analyst: assessing ${todo.length} project${todo.length === 1 ? '' : 's'}.`)

  for (const project of todo) {
    if (outOfTime(ctx.budget)) {
      return { completed, incomplete: true, note: 'Analyst paused — out of time.' }
    }
    const budget = budgetCheck(ctx.budget)
    if (!budget.ok) {
      return { completed, incomplete: true, note: `Analyst stopped: ${budget.reason}` }
    }

    const { data: tonight } = await db()
      .from('observations')
      .select('*')
      .eq('run_id', ctx.runId)
      .eq('project_id', project.id)

    const { data: recent } = await db()
      .from('observations')
      .select('kind, title, observed_at')
      .eq('project_id', project.id)
      .neq('run_id', ctx.runId)
      .order('observed_at', { ascending: false })
      .limit(15)

    const idle = daysSince(project.last_activity_at)
    const observations = (tonight ?? []) as Observation[]

    const result = await think<AnalystOutput>({
      agent: 'analyst',
      system: SYSTEM,
      effort: 'medium',
      schema: SCHEMA,
      prompt: [
        `Project: ${project.name}`,
        `Goal: ${project.goal ?? 'not recorded — this is itself a problem worth flagging'}`,
        `Current health on record: ${project.health}${project.health_note ? ` (${project.health_note})` : ''}`,
        `Next milestone: ${project.next_milestone ?? 'none recorded'}`,
        project.due_at ? `Due: ${project.due_at}` : '',
        idle === null
          ? 'No activity has ever been detected on this project.'
          : `Last detected activity: ${idle} day${idle === 1 ? '' : 's'} ago.`,
        '',
        'Observed tonight:',
        observations.length === 0
          ? '  (nothing — no sources returned anything)'
          : observations.map((o) => `  [${o.kind}] ${o.title} — ${o.detail ?? ''}`).join('\n'),
        '',
        'Previously observed:',
        (recent ?? []).length === 0
          ? '  (no history — this is the first review)'
          : (recent ?? [])
              .map((o) => `  [${o.kind}] ${o.title} (${String(o.observed_at).slice(0, 10)})`)
              .join('\n'),
      ]
        .filter(Boolean)
        .join('\n'),
      dryRunValue: {
        health:
          idle !== null && idle > STALE_AFTER_DAYS ? 'stalled' : ('unknown' as Health),
        health_note: 'Dry run — health was inferred from activity dates, not assessed.',
        headline: `${observations.length} observations recorded tonight.`,
        concerns: [],
      },
    })

    ctx.usage = addUsage(ctx.usage, result.usage)
    ctx.budget.spentPennies += result.usage.costPennies

    let health = result.value.health

    // A deterministic floor under the model's judgement. Long silence is
    // stalled, whatever a generous reading of the evidence might suggest.
    if (idle !== null && idle > STALE_AFTER_DAYS && health === 'on_track') {
      health = 'stalled'
      ctx.log(
        `  ${project.name}: overriding on_track — ${idle} days of silence is stalled by definition.`,
      )
    }

    await db()
      .from('projects')
      .update({ health, health_note: result.value.health_note })
      .eq('id', project.id)

    if (result.value.concerns.length > 0) {
      await db()
        .from('observations')
        .insert(
          result.value.concerns.map((c) => ({
            run_id: ctx.runId,
            project_id: project.id,
            source: 'analyst',
            kind: c.severity === 'high' ? 'blocker' : 'risk',
            title: c.title.slice(0, 300),
            detail: c.detail,
            confidence: 0.7,
          })),
        )
    }

    ctx.log(`  ${project.name}: ${health}. ${result.value.headline}`)
    completed.push(project.id)
  }

  return { completed, incomplete: false, note: `Analyst assessed ${completed.length} projects.` }
}
