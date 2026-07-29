import { configProblems } from '@/lib/env'

/**
 * Shown when something important isn't configured. A half-set-up Nightshift
 * that silently does nothing is worse than one that says what's missing.
 */
export function SetupNotice() {
  const problems = configProblems()
  if (problems.length === 0) return null

  const blocking = problems.filter((p) => p.blocking)
  const warnings = problems.filter((p) => !p.blocking)

  return (
    <div className="space-y-3">
      {blocking.length > 0 ? (
        <div className="panel border-red-500/30 bg-red-500/[0.06] p-4">
          <p className="mb-2 text-sm font-semibold text-red-200">
            Nightshift can&rsquo;t run yet
          </p>
          <ul className="space-y-1.5 text-sm text-red-100/80">
            {blocking.map((p) => (
              <li key={p.key}>
                <code className="rounded bg-red-500/15 px-1 py-0.5 font-mono text-[13px]">
                  {p.key}
                </code>{' '}
                — {p.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="panel border-amber-500/25 bg-amber-500/[0.05] p-4">
          <p className="mb-2 text-sm font-semibold text-amber-200">Worth setting up</p>
          <ul className="space-y-1.5 text-sm text-amber-100/75">
            {warnings.map((p) => (
              <li key={p.key}>
                <code className="rounded bg-amber-500/15 px-1 py-0.5 font-mono text-[13px]">
                  {p.key}
                </code>{' '}
                — {p.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function BlockingSetupScreen() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nightshift isn&rsquo;t connected yet</h1>
        <p className="mt-2 text-sm text-ink-400">
          The crew needs somewhere to keep what it learns. Set these in your Vercel project
          settings (or <code className="font-mono text-[13px]">.env.local</code> if you&rsquo;re
          running locally), then reload.
        </p>
      </div>
      <SetupNotice />
      <div className="panel p-4 text-sm text-ink-400">
        <p className="mb-2 font-medium text-ink-200">Setting up from scratch?</p>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Create a Supabase project.</li>
          <li>
            Run <code className="font-mono text-[13px]">supabase/migrations/001_init.sql</code> in
            its SQL editor.
          </li>
          <li>
            Copy the project URL and the <em>service role</em> key into{' '}
            <code className="font-mono text-[13px]">SUPABASE_URL</code> and{' '}
            <code className="font-mono text-[13px]">SUPABASE_SERVICE_ROLE_KEY</code>.
          </li>
        </ol>
      </div>
    </div>
  )
}
