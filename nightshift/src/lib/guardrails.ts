import { autonomyLevel, limits, type AutonomyLevel } from './env'
import type { Risk } from './types'

/**
 * The rules that stand between "an agent had an idea at 3am" and "something
 * irreversible happened to your business".
 *
 * The design principle: the crew can always *think* about anything, and can
 * always *propose* anything. What it may *do* is a short, explicit list.
 * Anything not on that list is queued for you, not attempted.
 */

export interface ActionKindSpec {
  kind: string
  label: string
  risk: Risk
  /** Plain-English description shown in the dashboard next to the action. */
  describes: string
}

/**
 * Every action the crew is allowed to propose. The Planner is given this
 * list verbatim; a `kind` outside it is rejected before it reaches the
 * Operator, so a hallucinated capability can't become a real one.
 */
export const ACTION_KINDS: ActionKindSpec[] = [
  {
    kind: 'set_health',
    label: 'Update project health',
    risk: 'low',
    describes: "Change a project's health status and the note explaining why.",
  },
  {
    kind: 'set_next_milestone',
    label: 'Set next milestone',
    risk: 'low',
    describes: 'Record what the project is working towards next.',
  },
  {
    kind: 'log_note',
    label: 'Write a project note',
    risk: 'low',
    describes: 'Add a dated note to the project timeline. Nothing leaves the system.',
  },
  {
    kind: 'raise_decision',
    label: 'Escalate a decision',
    risk: 'low',
    describes: 'Put a question in front of you rather than guessing at the answer.',
  },
  {
    kind: 'draft_task_list',
    label: 'Draft next steps',
    risk: 'low',
    describes: 'Propose a concrete list of next actions for you to pick up.',
  },
  {
    kind: 'flag_stale',
    label: 'Flag as stalled',
    risk: 'low',
    describes: 'Mark a project that has shown no movement for long enough to matter.',
  },
  {
    kind: 'reprioritise',
    label: 'Change priority',
    risk: 'medium',
    describes: "Move a project up or down the crew's attention order.",
  },
  {
    kind: 'pause_project',
    label: 'Pause a project',
    risk: 'medium',
    describes: 'Stop reviewing a project nightly. Reversible from the dashboard.',
  },
  {
    kind: 'draft_external_message',
    label: 'Draft an outbound message',
    risk: 'high',
    describes: 'Write a message intended for someone outside the system. Never sent automatically.',
  },
]

const KIND_INDEX = new Map(ACTION_KINDS.map((k) => [k.kind, k]))

export function specFor(kind: string): ActionKindSpec | null {
  return KIND_INDEX.get(kind) ?? null
}

export function isKnownKind(kind: string): boolean {
  return KIND_INDEX.has(kind)
}

/**
 * Risk is decided here, from the kind — not by the model. An agent that
 * could label its own action "low risk" would eventually do so.
 */
export function riskOf(kind: string): Risk {
  return KIND_INDEX.get(kind)?.risk ?? 'high'
}

export interface Verdict {
  allowed: boolean
  reason: string
}

export function mayExecute(kind: string, level: AutonomyLevel = autonomyLevel()): Verdict {
  const spec = KIND_INDEX.get(kind)
  if (!spec) {
    return { allowed: false, reason: `"${kind}" is not an action Nightshift knows how to take.` }
  }
  if (level === 'dry_run') {
    return { allowed: false, reason: 'Running in dry-run mode — nothing is executed.' }
  }
  if (spec.risk === 'high') {
    return {
      allowed: false,
      reason: 'High-risk actions always wait for you, at every autonomy level.',
    }
  }
  if (spec.risk === 'medium' && level === 'low_risk_live') {
    return {
      allowed: false,
      reason: 'Autonomy is set to low-risk-only, and this action is medium risk.',
    }
  }
  return { allowed: true, reason: 'Within the configured autonomy level.' }
}

export interface BudgetState {
  actionsExecuted: number
  spentPennies: number
  startedAt: number
}

export function newBudget(): BudgetState {
  return { actionsExecuted: 0, spentPennies: 0, startedAt: Date.now() }
}

export interface BudgetVerdict {
  ok: boolean
  reason?: string
}

/** Checked before every model call and every executed action. */
export function budgetCheck(b: BudgetState): BudgetVerdict {
  if (b.spentPennies >= limits.maxSpendPennies) {
    return {
      ok: false,
      reason: `Spend ceiling reached (${limits.maxSpendPennies}p). Stopping to avoid a surprise bill.`,
    }
  }
  if (b.actionsExecuted >= limits.maxActionsPerRun) {
    return { ok: false, reason: `Action ceiling reached (${limits.maxActionsPerRun} this run).` }
  }
  return { ok: true }
}

/** True when this invocation is close enough to its wall clock to checkpoint. */
export function outOfTime(b: BudgetState): boolean {
  return Date.now() - b.startedAt > limits.invocationBudgetMs
}

/**
 * Constraints handed to every agent, verbatim, in its system prompt. Kept
 * here rather than duplicated across five files so there is exactly one
 * place to read to know what the crew has been told it must not do.
 */
export const HOUSE_RULES = `
You operate unsupervised, overnight, on someone's real projects. Behave accordingly.

- Never invent facts about a project. If you don't know, say you don't know and
  raise a decision instead of guessing.
- Every claim you make about what happened must be traceable to an observation
  you were given. If there is no evidence for it, it is speculation, and
  speculation belongs in a rationale, never in an observation.
- You cannot send email, message anyone, spend money, delete anything, or touch
  systems outside the ones described to you. Do not propose actions that assume
  otherwise.
- Prefer raising a decision over taking a consequential guess. An unanswered
  question in the morning is cheap; a wrong autonomous decision is not.
- Write for someone reading at 7am with a coffee. Lead with what changed. Be
  specific and brief. No filler, no restating the question, no hedging padding.
`.trim()
