export type ProjectStatus = 'active' | 'paused' | 'archived'
export type Health = 'unknown' | 'on_track' | 'at_risk' | 'stalled' | 'blocked'
export type RunStatus = 'running' | 'ok' | 'failed' | 'cancelled'
export type RunMode = 'live' | 'dry_run'
export type RunTrigger = 'cron' | 'manual' | 'resume'
export type Phase = 'scout' | 'analyst' | 'planner' | 'operator' | 'scribe' | 'done'
export type ObservationKind = 'progress' | 'risk' | 'blocker' | 'signal' | 'idle'
export type Risk = 'low' | 'medium' | 'high'
export type ActionStatus =
  | 'proposed'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'failed'
  | 'skipped'
export type Urgency = 'low' | 'normal' | 'high'
export type SourceKind = 'github_repo' | 'url' | 'note' | 'manual'

export interface Project {
  id: string
  slug: string
  name: string
  summary: string | null
  goal: string | null
  status: ProjectStatus
  health: Health
  health_note: string | null
  priority: number
  next_milestone: string | null
  due_at: string | null
  last_activity_at: string | null
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface ProjectSource {
  id: string
  project_id: string
  kind: SourceKind
  label: string | null
  config: Record<string, unknown>
  enabled: boolean
  last_polled_at: string | null
  last_error: string | null
  created_at: string
}

export interface Run {
  id: string
  status: RunStatus
  mode: RunMode
  trigger: RunTrigger
  phase: Phase
  cursor: RunCursor
  started_at: string
  finished_at: string | null
  summary: string | null
  error: string | null
  input_tokens: number
  output_tokens: number
  cost_pennies: number
  created_at: string
}

/**
 * Serverless functions get killed on a wall clock. Rather than lose a
 * night's work to a timeout, each phase records how far it got here and a
 * later tick picks the run back up.
 */
export interface RunCursor {
  /** Project ids already handled in the current phase. */
  done?: string[]
  /** Free-form scratch space for a phase that needs more than a list. */
  notes?: Record<string, unknown>
}

export interface Observation {
  id: string
  run_id: string
  project_id: string | null
  source: string
  kind: ObservationKind
  title: string
  detail: string | null
  evidence: Evidence[]
  confidence: number
  observed_at: string
}

export interface Evidence {
  label: string
  value: string
  url?: string
}

export interface Action {
  id: string
  run_id: string
  project_id: string | null
  agent: string
  kind: string
  title: string
  rationale: string | null
  payload: Record<string, unknown>
  risk: Risk
  status: ActionStatus
  result: Record<string, unknown> | null
  executed_at: string | null
  created_at: string
}

export interface Decision {
  id: string
  run_id: string | null
  project_id: string | null
  question: string
  context: string | null
  options: DecisionOption[]
  urgency: Urgency
  status: 'open' | 'answered' | 'dismissed'
  answer: string | null
  answered_at: string | null
  created_at: string
}

export interface DecisionOption {
  label: string
  consequence?: string
}

export interface Brief {
  id: string
  run_id: string
  brief_date: string
  headline: string
  body_md: string
  stats: BriefStats
  created_at: string
}

export interface BriefStats {
  projects_reviewed?: number
  observations?: number
  actions_executed?: number
  decisions_open?: number
  cost_pennies?: number
  [key: string]: unknown
}

export const HEALTH_LABEL: Record<Health, string> = {
  unknown: 'Not yet reviewed',
  on_track: 'On track',
  at_risk: 'At risk',
  stalled: 'Stalled',
  blocked: 'Blocked',
}

export const HEALTH_ORDER: Health[] = ['blocked', 'stalled', 'at_risk', 'on_track', 'unknown']
