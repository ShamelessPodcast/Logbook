/**
 * Every environment variable Nightshift reads, in one place, with an
 * honest answer to "is this thing actually configured?".
 *
 * Nothing throws at import time. A half-configured deploy should render a
 * setup screen, not a 500.
 */

function str(name: string): string | null {
  const v = process.env[name]
  return v && v.trim().length > 0 ? v.trim() : null
}

export const env = {
  supabaseUrl: str('SUPABASE_URL') ?? str('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceKey: str('SUPABASE_SERVICE_ROLE_KEY'),

  anthropicKey: str('ANTHROPIC_API_KEY'),
  /** Overridable so a cost-sensitive night can drop a tier without a deploy. */
  model: str('NIGHTSHIFT_MODEL') ?? 'claude-opus-5',

  cronSecret: str('CRON_SECRET'),
  dashboardPassword: str('NIGHTSHIFT_PASSWORD'),

  githubToken: str('GITHUB_TOKEN'),

  appUrl: str('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000',
  timezone: str('NIGHTSHIFT_TIMEZONE') ?? 'Europe/London',
}

/**
 * How much rope the crew gets.
 *
 *   dry_run        — think, write everything down, execute nothing.
 *   low_risk_live  — execute low-risk actions; queue medium and high.
 *   full_live      — execute low and medium; high always waits for a human.
 *
 * High-risk actions are never auto-executed at any level. That isn't a
 * setting; it's the point.
 */
export type AutonomyLevel = 'dry_run' | 'low_risk_live' | 'full_live'

export function autonomyLevel(): AutonomyLevel {
  const raw = str('NIGHTSHIFT_AUTONOMY')
  if (raw === 'dry_run' || raw === 'low_risk_live' || raw === 'full_live') return raw
  // No key means nothing can run anyway — be explicit about it.
  return env.anthropicKey ? 'low_risk_live' : 'dry_run'
}

export const limits = {
  /** Projects the Scout will look at in a single run. */
  maxProjectsPerRun: Number(process.env.NIGHTSHIFT_MAX_PROJECTS ?? 25),
  /** Actions the Operator will execute in a single run. */
  maxActionsPerRun: Number(process.env.NIGHTSHIFT_MAX_ACTIONS ?? 40),
  /** Hard spend ceiling per run, in pennies. The run stops when it's hit. */
  maxSpendPennies: Number(process.env.NIGHTSHIFT_MAX_SPEND_PENNIES ?? 200),
  /**
   * Wall-clock budget for one serverless invocation, in ms. Below Vercel's
   * maxDuration so the run can checkpoint itself instead of being killed.
   */
  invocationBudgetMs: Number(process.env.NIGHTSHIFT_BUDGET_MS ?? 240_000),
}

export interface ConfigProblem {
  key: string
  detail: string
  blocking: boolean
}

/** What's missing, and whether it stops the system working at all. */
export function configProblems(): ConfigProblem[] {
  const problems: ConfigProblem[] = []

  if (!env.supabaseUrl) {
    problems.push({
      key: 'SUPABASE_URL',
      detail: 'No database. Nightshift has nowhere to store projects or run history.',
      blocking: true,
    })
  }
  if (!env.supabaseServiceKey) {
    problems.push({
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      detail: 'No service key. The dashboard and the nightly run cannot reach the database.',
      blocking: true,
    })
  }
  if (!env.anthropicKey) {
    problems.push({
      key: 'ANTHROPIC_API_KEY',
      detail:
        'No model access. The crew will run in dry-run mode: it records what it would do, and does none of it.',
      blocking: false,
    })
  }
  if (!env.cronSecret) {
    problems.push({
      key: 'CRON_SECRET',
      detail: 'The nightly endpoint is unauthenticated — anyone who finds the URL can trigger a run.',
      blocking: false,
    })
  }
  if (!env.dashboardPassword) {
    problems.push({
      key: 'NIGHTSHIFT_PASSWORD',
      detail: 'The dashboard is open to anyone with the link.',
      blocking: false,
    })
  }

  return problems
}

export function isConfigured(): boolean {
  return !configProblems().some((p) => p.blocking)
}
