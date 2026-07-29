import { audit, db } from '../db'
import { budgetCheck, mayExecute, outOfTime, riskOf } from '../guardrails'
import type { Action, Health, Urgency } from '../types'
import type { PhaseResult, RunContext } from './context'

/**
 * The Operator.
 *
 * The only agent that changes anything, and the only one with no access to
 * the model. It reads proposed actions, asks the guardrails whether each is
 * permitted, and either performs it or leaves it for you.
 *
 * Everything it does is a small, reversible write to Nightshift's own
 * database. It has no ability to reach outside the system — no email, no
 * money, no deletion, no third-party APIs. That is a property of the code,
 * not a promise in a prompt.
 */

interface Outcome {
  ok: boolean
  detail: string
  data?: Record<string, unknown>
}

function str(payload: Record<string, unknown>, key: string): string | null {
  const v = payload[key]
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

const HEALTHS: Health[] = ['unknown', 'on_track', 'at_risk', 'stalled', 'blocked']

async function perform(action: Action): Promise<Outcome> {
  const p = action.payload ?? {}

  switch (action.kind) {
    case 'set_health': {
      if (!action.project_id) return { ok: false, detail: 'No project on this action.' }
      const health = str(p, 'health') as Health | null
      if (!health || !HEALTHS.includes(health)) {
        return { ok: false, detail: `"${String(p.health)}" is not a health value.` }
      }
      await db()
        .from('projects')
        .update({ health, health_note: str(p, 'note') ?? action.rationale })
        .eq('id', action.project_id)
      return { ok: true, detail: `Health set to ${health}.` }
    }

    case 'flag_stale': {
      if (!action.project_id) return { ok: false, detail: 'No project on this action.' }
      await db()
        .from('projects')
        .update({
          health: 'stalled',
          health_note: str(p, 'reason') ?? action.rationale,
        })
        .eq('id', action.project_id)
      return { ok: true, detail: 'Marked stalled.' }
    }

    case 'set_next_milestone': {
      if (!action.project_id) return { ok: false, detail: 'No project on this action.' }
      const milestone = str(p, 'milestone')
      if (!milestone) return { ok: false, detail: 'No milestone text supplied.' }
      await db()
        .from('projects')
        .update({ next_milestone: milestone.slice(0, 500) })
        .eq('id', action.project_id)
      return { ok: true, detail: `Next milestone: ${milestone}` }
    }

    case 'log_note': {
      const text = str(p, 'text')
      if (!text) return { ok: false, detail: 'No note text supplied.' }
      await db().from('observations').insert({
        run_id: action.run_id,
        project_id: action.project_id,
        source: 'operator',
        kind: 'signal',
        title: text.slice(0, 300),
        detail: action.rationale,
        confidence: 1,
      })
      return { ok: true, detail: 'Note added to the project timeline.' }
    }

    case 'raise_decision': {
      const question = str(p, 'question')
      if (!question) return { ok: false, detail: 'No question supplied.' }
      const urgencyRaw = str(p, 'urgency')
      const urgency: Urgency =
        urgencyRaw === 'low' || urgencyRaw === 'high' ? urgencyRaw : 'normal'
      const options = Array.isArray(p.options)
        ? (p.options as unknown[])
            .map((o) =>
              typeof o === 'string'
                ? { label: o }
                : o && typeof o === 'object'
                  ? (o as Record<string, unknown>)
                  : null,
            )
            .filter(Boolean)
            .slice(0, 6)
        : []

      const { data } = await db()
        .from('decisions')
        .insert({
          run_id: action.run_id,
          project_id: action.project_id,
          question: question.slice(0, 1000),
          context: str(p, 'context') ?? action.rationale,
          options,
          urgency,
          status: 'open',
        })
        .select('id')
        .single()

      return { ok: true, detail: 'Question queued for you.', data: { decision_id: data?.id } }
    }

    case 'draft_task_list': {
      const tasks = Array.isArray(p.tasks)
        ? (p.tasks as unknown[]).map((t) => String(t)).slice(0, 20)
        : []
      if (tasks.length === 0) return { ok: false, detail: 'No tasks supplied.' }
      // The draft is the deliverable; it lives on the action itself.
      return { ok: true, detail: `Drafted ${tasks.length} next steps.`, data: { tasks } }
    }

    case 'reprioritise': {
      if (!action.project_id) return { ok: false, detail: 'No project on this action.' }
      const priority = Number(p.priority)
      if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
        return { ok: false, detail: `Priority must be 1-5, got "${String(p.priority)}".` }
      }
      await db().from('projects').update({ priority }).eq('id', action.project_id)
      return { ok: true, detail: `Priority set to ${priority}.` }
    }

    case 'pause_project': {
      if (!action.project_id) return { ok: false, detail: 'No project on this action.' }
      await db().from('projects').update({ status: 'paused' }).eq('id', action.project_id)
      return { ok: true, detail: 'Project paused. It will not be reviewed until you resume it.' }
    }

    default:
      return { ok: false, detail: `No handler for "${action.kind}".` }
  }
}

export async function runOperator(ctx: RunContext, _alreadyDone: string[]): Promise<PhaseResult> {
  const { data } = await db()
    .from('actions')
    .select('*')
    .eq('run_id', ctx.runId)
    .in('status', ['proposed', 'approved'])
    .order('created_at', { ascending: true })

  const actions = (data ?? []) as Action[]
  ctx.log(`Operator: ${actions.length} action${actions.length === 1 ? '' : 's'} to consider.`)

  let executed = 0
  let queued = 0

  for (const action of actions) {
    if (outOfTime(ctx.budget)) {
      return { completed: [], incomplete: true, note: 'Operator paused — out of time.' }
    }
    const budget = budgetCheck(ctx.budget)
    if (!budget.ok) {
      ctx.log(`  Stopping: ${budget.reason}`)
      return { completed: [], incomplete: false, note: `Operator stopped: ${budget.reason}` }
    }

    // An explicitly approved action bypasses the autonomy level — you said yes.
    const verdict =
      action.status === 'approved'
        ? { allowed: true, reason: 'Approved by you.' }
        : mayExecute(action.kind)

    if (!verdict.allowed) {
      await db()
        .from('actions')
        .update({ result: { queued_because: verdict.reason } })
        .eq('id', action.id)
      await audit('operator', 'action.queued', action.id, {
        kind: action.kind,
        reason: verdict.reason,
      })
      ctx.log(`  Queued "${action.title}" — ${verdict.reason}`)
      queued += 1
      continue
    }

    let outcome: Outcome
    try {
      outcome = await perform(action)
    } catch (err) {
      outcome = { ok: false, detail: err instanceof Error ? err.message : String(err) }
    }

    await db()
      .from('actions')
      .update({
        status: outcome.ok ? 'executed' : 'failed',
        result: { detail: outcome.detail, ...(outcome.data ?? {}) },
        executed_at: new Date().toISOString(),
      })
      .eq('id', action.id)

    await audit('operator', outcome.ok ? 'action.executed' : 'action.failed', action.id, {
      kind: action.kind,
      risk: riskOf(action.kind),
      detail: outcome.detail,
    })

    if (outcome.ok) {
      executed += 1
      ctx.budget.actionsExecuted += 1
      ctx.log(`  Did "${action.title}" — ${outcome.detail}`)
    } else {
      ctx.log(`  Failed "${action.title}" — ${outcome.detail}`)
    }
  }

  return {
    completed: [],
    incomplete: false,
    note: `Operator executed ${executed} action${executed === 1 ? '' : 's'}, queued ${queued} for you.`,
  }
}
