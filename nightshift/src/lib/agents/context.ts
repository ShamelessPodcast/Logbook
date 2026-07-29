import type { BudgetState } from '../guardrails'
import type { Usage } from '../llm'
import type { RunMode } from '../types'

/** Threaded through every agent in a run. Mutated as the run progresses. */
export interface RunContext {
  runId: string
  mode: RunMode
  budget: BudgetState
  usage: Usage
  /** Lines shown live in the run transcript. */
  log: (message: string) => void
}

export interface PhaseResult {
  /** Project ids this phase finished. Merged into the run cursor. */
  completed: string[]
  /** True when the phase ran out of wall clock and should be resumed. */
  incomplete: boolean
  note: string
}
