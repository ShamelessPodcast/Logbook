import { db } from '../db'
import { HOUSE_RULES } from '../guardrails'
import { addUsage, objectSchema, think } from '../llm'
import type { Action, Decision, Observation, Project } from '../types'
import type { PhaseResult, RunContext } from './context'

/**
 * The Scribe.
 *
 * Writes the one thing you actually read: the morning brief. Everything
 * else the crew did exists so that this can be short and true.
 *
 * It writes last, sees the whole night, and is told explicitly that a quiet
 * night should produce a short brief. A system that manufactures three
 * paragraphs every morning stops being read within a week.
 */

const SYSTEM = `
You are the Scribe on an overnight project-management crew. You write the
morning brief — the first thing the owner reads with their coffee.

${HOUSE_RULES}

How to write it:
- Open with the single most important thing. If one project is on fire, that
  is the headline, not a summary of the night.
- Then: what needs them today, and nothing else that pretends to.
- Then: what changed, project by project, one line each. Skip projects where
  genuinely nothing happened rather than writing "no change" nine times.
- If the night was quiet, say so in two sentences and stop. A short brief on a
  quiet night is the correct output and builds trust. Padding destroys it.
- Never claim work was done that the crew did not do. You are reporting, not
  selling.
- Markdown. No title heading — the page supplies one. Use ## for sections.
- Second person. "Your", "you". Not "the user".
`.trim()

const SCHEMA = objectSchema({
  headline: {
    type: 'string',
    description: 'One sentence, under 140 characters. The thing that matters most.',
  },
  body_md: {
    type: 'string',
    description: 'The brief itself, in Markdown.',
  },
})

interface ScribeOutput {
  headline: string
  body_md: string
}

export async function runScribe(ctx: RunContext, projects: Project[]): Promise<PhaseResult> {
  const [{ data: observations }, { data: actions }, { data: decisions }] = await Promise.all([
    db().from('observations').select('*').eq('run_id', ctx.runId),
    db().from('actions').select('*').eq('run_id', ctx.runId),
    db().from('decisions').select('*').eq('status', 'open'),
  ])

  const obs = (observations ?? []) as Observation[]
  const acts = (actions ?? []) as Action[]

  // Urgency is a text column, so sorting it in the query would order it
  // alphabetically — "normal" before "high". Rank it properly here so the
  // Scribe sees the urgent ones first and leads with them.
  const URGENCY_RANK: Record<string, number> = { high: 0, normal: 1, low: 2 }
  const decs = ((decisions ?? []) as Decision[]).sort(
    (a, b) => (URGENCY_RANK[a.urgency] ?? 1) - (URGENCY_RANK[b.urgency] ?? 1),
  )
  const byId = new Map(projects.map((p) => [p.id, p]))

  const executed = acts.filter((a) => a.status === 'executed')
  const waiting = acts.filter((a) => a.status === 'proposed' || a.status === 'approved')

  const projectLines = projects
    .map((p) => {
      const mine = obs.filter((o) => o.project_id === p.id)
      const acted = executed.filter((a) => a.project_id === p.id)
      return [
        `- ${p.name} — health: ${p.health}${p.health_note ? ` (${p.health_note})` : ''}`,
        ...mine.slice(0, 6).map((o) => `    [${o.kind}] ${o.title}`),
        ...acted.map((a) => `    did: ${a.title}`),
      ].join('\n')
    })
    .join('\n')

  const result = await think<ScribeOutput>({
    agent: 'scribe',
    system: SYSTEM,
    effort: 'medium',
    schema: SCHEMA,
    prompt: [
      `Run mode: ${ctx.mode}${ctx.mode === 'dry_run' ? ' — nothing was actually executed tonight; say so plainly.' : ''}`,
      `Projects reviewed: ${projects.length}`,
      `Observations recorded: ${obs.length}`,
      `Actions executed: ${executed.length}`,
      `Actions waiting for approval: ${waiting.length}`,
      '',
      'Per project:',
      projectLines || '(no active projects)',
      '',
      'Open questions waiting on the owner:',
      decs
        .map(
          (d) =>
            `- [${d.urgency}] ${byId.get(d.project_id ?? '')?.name ?? 'general'}: ${d.question}`,
        )
        .join('\n') || '(none)',
      '',
      'Actions waiting for approval:',
      waiting
        .map(
          (a) =>
            `- ${byId.get(a.project_id ?? '')?.name ?? 'general'}: ${a.title} (${a.risk} risk)`,
        )
        .join('\n') || '(none)',
    ].join('\n'),
    dryRunValue: {
      headline: `${projects.length} projects reviewed, ${obs.length} observations, ${executed.length} actions taken.`,
      body_md: [
        '_Nightshift ran without an `ANTHROPIC_API_KEY`, so no brief was written._',
        '',
        'Sources were still polled and observations recorded verbatim, so you can see the',
        'plumbing works end to end. Add the key and the crew starts thinking.',
        '',
        '## What was collected',
        '',
        ...projects.map((p) => {
          const n = obs.filter((o) => o.project_id === p.id).length
          return `- **${p.name}** — ${n} raw observation${n === 1 ? '' : 's'}`
        }),
      ].join('\n'),
    },
  })

  ctx.usage = addUsage(ctx.usage, result.usage)
  ctx.budget.spentPennies += result.usage.costPennies

  await db().from('briefs').insert({
    run_id: ctx.runId,
    headline: result.value.headline.slice(0, 500),
    body_md: result.value.body_md,
    stats: {
      projects_reviewed: projects.length,
      observations: obs.length,
      actions_executed: executed.length,
      actions_waiting: waiting.length,
      decisions_open: decs.length,
      cost_pennies: ctx.usage.costPennies,
    },
  })

  ctx.log(`Scribe: brief written — "${result.value.headline}"`)
  return { completed: [], incomplete: false, note: result.value.headline }
}
