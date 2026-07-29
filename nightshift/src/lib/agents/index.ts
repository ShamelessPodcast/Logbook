export { runScout } from './scout'
export { runAnalyst } from './analyst'
export { runPlanner } from './planner'
export { runOperator } from './operator'
export { runScribe } from './scribe'
export type { RunContext, PhaseResult } from './context'

export interface CrewMember {
  key: string
  name: string
  role: string
  /** What it is allowed to change. Shown in the dashboard verbatim. */
  writes: string
  usesModel: boolean
}

/**
 * The crew, in the order they run. Each one does a single job and hands on;
 * none of them can do another's. That's what makes the guardrails
 * meaningful — only the Operator writes, and the Operator can't think.
 */
export const CREW: CrewMember[] = [
  {
    key: 'scout',
    name: 'Scout',
    role: 'Reads every source on every active project and records what it finds as plain facts.',
    writes: 'Observations only.',
    usesModel: true,
  },
  {
    key: 'analyst',
    name: 'Analyst',
    role: 'Judges how each project is actually going, against its goal and its history.',
    writes: 'Project health, and risks it spots.',
    usesModel: true,
  },
  {
    key: 'planner',
    name: 'Planner',
    role: 'Decides what should happen next, chosen only from the permitted action catalogue.',
    writes: 'Proposed actions. Executes nothing.',
    usesModel: true,
  },
  {
    key: 'operator',
    name: 'Operator',
    role: 'Performs the actions the guardrails permit and queues the rest for you.',
    writes: 'Projects, decisions, the audit log.',
    usesModel: false,
  },
  {
    key: 'scribe',
    name: 'Scribe',
    role: 'Writes the morning brief from everything the night produced.',
    writes: 'One brief.',
    usesModel: true,
  },
]
