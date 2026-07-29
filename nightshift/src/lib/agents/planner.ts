import { db } from '../db'
import {
  ACTION_KINDS,
  budgetCheck,
  HOUSE_RULES,
  isKnownKind,
  outOfTime,
  riskOf,
} from '../guardrails'
import { addUsage, objectSchema, think } from '../llm'
import type { Observation, Project } from '../types'
import type { PhaseResult, RunContext } from './context'

/**
 * The Planner.
 *
 * Decides what should happen next on each project and writes it down as
 * proposed actions. It proposes; it does not execute. The separation is
 * deliberate — one agent choosing and performing its own actions has no
 * point at which a rule can be applied.
 */

const CATALOGUE = ACTION_KINDS.map(
  (k) => `- ${k.kind} (${k.risk} risk): ${k.describes}`,
).join('\n')

const SYSTEM = `
You are the Planner on an overnight project-management crew.

You are given one project and what the Analyst concluded about it. You decide
what should happen next, expressed only as actions from this list:

${CATALOGUE}

${HOUSE_RULES}

Rules that matter more than the rest:
- Only ever use a "kind" from the list above. There is nothing else you can do.
  If the right next step isn't on the list, raise_decision and explain.
- Propose few actions, well chosen. Two useful ones beat six that create noise.
- If a project is fine and needs nothing, propose nothing. An empty plan is a
  valid and often correct plan.
- raise_decision is for questions only a human can answer: trade-offs, money,
  priorities between projects, anything involving other people. Use it freely.
  It is always better than a confident guess.
- Every action needs a rationale that points at the specific evidence behind it.
`.trim()

const SCHEMA = objectSchema({
  actions: {
    type: 'array',
    items: objectSchema({
      kind: { type: 'string', description: 'Must be one of the listed action kinds.' },
      title: { type: 'string', description: 'One line describing the action.' },
      rationale: { type: 'string', description: 'Why, referencing the evidence.' },
      payload: {
        type: 'object',
        description:
          'Action-specific fields. set_health: {health, note}. set_next_milestone: {milestone}. ' +
          'log_note: {text}. raise_decision: {question, context, options[], urgency}. ' +
          'draft_task_list: {tasks[]}. reprioritise: {priority}. pause_project: {reason}. ' +
          'draft_external_message: {recipient, subject, body}. flag_stale: {reason}.',
        additionalProperties: true,
        properties: {},
      },
    }),
  },
})

interface PlannerOutput {
  actions: Array<{
    kind: string
    title: string
    rationale: string
    payload: Record<string, unknown>
  }>
}

/** Actions per project. Keeps one noisy project from swamping the morning. */
const MAX_PER_PROJECT = 5

export async function runPlanner(
  ctx: RunContext,
  projects: Project[],
  alreadyDone: string[],
): Promise<PhaseResult> {
  const completed: string[] = []
  const todo = projects.filter((p) => !alreadyDone.includes(p.id))

  ctx.log(`Planner: deciding next steps for ${todo.length} project${todo.length === 1 ? '' : 's'}.`)

  for (const project of todo) {
    if (outOfTime(ctx.budget)) {
      return { completed, incomplete: true, note: 'Planner paused — out of time.' }
    }
    const budget = budgetCheck(ctx.budget)
    if (!budget.ok) {
      return { completed, incomplete: true, note: `Planner stopped: ${budget.reason}` }
    }

    const { data: observations } = await db()
      .from('observations')
      .select('*')
      .eq('run_id', ctx.runId)
      .eq('project_id', project.id)

    const { data: openDecisions } = await db()
      .from('decisions')
      .select('question')
      .eq('project_id', project.id)
      .eq('status', 'open')

    // Re-read the project: the Analyst just changed health on it.
    const { data: fresh } = await db()
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single()
    const current = (fresh ?? project) as Project

    const result = await think<PlannerOutput>({
      agent: 'planner',
      system: SYSTEM,
      effort: 'medium',
      schema: SCHEMA,
      prompt: [
        `Project: ${current.name}`,
        `Goal: ${current.goal ?? 'not recorded'}`,
        `Health: ${current.health} — ${current.health_note ?? 'no note'}`,
        `Priority: ${current.priority} (1 is highest)`,
        `Next milestone: ${current.next_milestone ?? 'none recorded'}`,
        current.due_at ? `Due: ${current.due_at}` : '',
        '',
        'Tonight’s observations:',
        ((observations ?? []) as Observation[])
          .map((o) => `  [${o.kind}] ${o.title} — ${o.detail ?? ''}`)
          .join('\n') || '  (none)',
        '',
        'Questions already waiting on the human — do not ask these again:',
        (openDecisions ?? []).map((d) => `  - ${d.question}`).join('\n') || '  (none)',
      ]
        .filter(Boolean)
        .join('\n'),
      dryRunValue: { actions: [] },
    })

    ctx.usage = addUsage(ctx.usage, result.usage)
    ctx.budget.spentPennies += result.usage.costPennies

    const accepted = result.value.actions
      .filter((a) => {
        if (isKnownKind(a.kind)) return true
        ctx.log(`  Rejected an action of unknown kind "${a.kind}" on ${current.name}.`)
        return false
      })
      .slice(0, MAX_PER_PROJECT)

    if (accepted.length > 0) {
      await db()
        .from('actions')
        .insert(
          accepted.map((a) => ({
            run_id: ctx.runId,
            project_id: project.id,
            agent: 'planner',
            kind: a.kind,
            title: a.title.slice(0, 300),
            rationale: a.rationale,
            payload: a.payload ?? {},
            // Risk comes from the catalogue, never from the model.
            risk: riskOf(a.kind),
            status: 'proposed',
          })),
        )
    }

    ctx.log(
      `  ${current.name}: ${accepted.length} action${accepted.length === 1 ? '' : 's'} proposed.`,
    )
    completed.push(project.id)
  }

  return { completed, incomplete: false, note: `Planner planned ${completed.length} projects.` }
}
