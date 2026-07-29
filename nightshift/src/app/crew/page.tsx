import { Nav } from '@/components/Nav'
import { CREW } from '@/lib/agents'
import { autonomyLevel, env, limits } from '@/lib/env'
import { ACTION_KINDS, mayExecute } from '@/lib/guardrails'

export const dynamic = 'force-dynamic'

const LEVELS = [
  {
    key: 'dry_run',
    name: 'Dry run',
    detail:
      'The crew thinks, writes everything down, and executes nothing. Good for the first few nights.',
  },
  {
    key: 'low_risk_live',
    name: 'Low risk live',
    detail: 'Low-risk actions happen automatically. Anything medium or high waits for you.',
  },
  {
    key: 'full_live',
    name: 'Full live',
    detail:
      'Low and medium-risk actions happen automatically. High-risk actions still always wait for you.',
  },
]

/**
 * The page that answers "what can this thing actually do to me?" — read from
 * the same catalogue the Planner is given, so it can't drift out of date.
 */
export default function CrewPage() {
  const level = autonomyLevel()

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">The crew</h1>
          <p className="mt-1 text-sm text-ink-400">
            Five agents, run in order, each with one job. They hand work to each other and only
            one of them is allowed to change anything.
          </p>
        </div>

        <section className="panel">
          <ol className="divide-y divide-ink-800">
            {CREW.map((member, i) => (
              <li key={member.key} className="flex gap-4 px-5 py-4">
                <span className="mt-0.5 font-mono text-xs text-ink-600">{i + 1}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink-100">{member.name}</span>
                    <span
                      className={`chip ${
                        member.usesModel
                          ? 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/25'
                          : 'bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40'
                      }`}
                    >
                      {member.usesModel ? 'uses the model' : 'code only'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-400">{member.role}</p>
                  <p className="mt-0.5 text-xs text-ink-500">Can write: {member.writes}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">Autonomy</span>
            <span className="text-xs text-ink-500">
              currently <span className="font-mono">{level}</span>
            </span>
          </div>
          <ul className="divide-y divide-ink-800">
            {LEVELS.map((l) => (
              <li
                key={l.key}
                className={`px-5 py-3 ${l.key === level ? 'bg-ink-850' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-100">{l.name}</span>
                  {l.key === level ? (
                    <span className="chip bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25">
                      active
                    </span>
                  ) : null}
                  <code className="ml-auto font-mono text-[11px] text-ink-500">{l.key}</code>
                </div>
                <p className="mt-1 text-sm text-ink-400">{l.detail}</p>
              </li>
            ))}
          </ul>
          <p className="border-t border-ink-800 px-5 py-3 text-xs text-ink-500">
            Set with <code className="font-mono">NIGHTSHIFT_AUTONOMY</code>. High-risk actions are
            never executed automatically at any level — that is enforced in code, not in a prompt.
          </p>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">Everything the crew is allowed to do</span>
          </div>
          <ul className="divide-y divide-ink-800">
            {ACTION_KINDS.map((k) => {
              const verdict = mayExecute(k.kind, level)
              return (
                <li key={k.kind} className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-ink-100">{k.label}</span>
                    <code className="font-mono text-[11px] text-ink-500">{k.kind}</code>
                    <span
                      className={`chip ml-auto ${
                        verdict.allowed
                          ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25'
                      }`}
                    >
                      {verdict.allowed ? 'runs automatically' : 'waits for you'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-400">{k.describes}</p>
                </li>
              )
            })}
          </ul>
          <p className="border-t border-ink-800 px-5 py-3 text-xs text-ink-500">
            This is the complete list. An action the Planner invents outside it is rejected before
            the Operator ever sees it. The crew cannot send email, message anyone, spend money,
            delete anything, or reach any system not listed as a project source.
          </p>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">Limits per run</span>
          </div>
          <dl className="divide-y divide-ink-800 text-sm">
            {[
              ['Projects reviewed', String(limits.maxProjectsPerRun)],
              ['Actions executed', String(limits.maxActionsPerRun)],
              ['Spend ceiling', `${limits.maxSpendPennies}p`],
              ['Model', env.model],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-2.5">
                <dt className="text-ink-400">{k}</dt>
                <dd className="font-mono text-ink-200">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  )
}
