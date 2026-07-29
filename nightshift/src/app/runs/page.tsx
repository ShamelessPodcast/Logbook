import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { BlockingSetupScreen } from '@/components/SetupNotice'
import { db } from '@/lib/db'
import { isConfigured } from '@/lib/env'
import { ago, pennies, shortDate, timeOfDay } from '@/lib/format'
import type { Run } from '@/lib/types'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, string> = {
  ok: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25',
  running: 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/25',
  failed: 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/25',
  cancelled: 'bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40',
}

export default async function RunsPage() {
  if (!isConfigured()) return <BlockingSetupScreen />

  const { data } = await db()
    .from('runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(60)

  const runs = (data ?? []) as Run[]
  const spend = runs.reduce((sum, r) => sum + Number(r.cost_pennies ?? 0), 0)

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Runs</h1>
          <p className="mt-1 text-sm text-ink-400">
            Every shift the crew has worked. Last {runs.length} runs cost {pennies(spend)}.
          </p>
        </div>

        <section className="panel">
          {runs.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-500">
              No runs yet. Press &ldquo;Run now&rdquo; to see one happen.
            </p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {runs.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/runs/${r.id}`}
                    className="block px-5 py-3 transition hover:bg-ink-850"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`chip ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                      <span className="text-sm text-ink-200">
                        {shortDate(r.started_at)} at {timeOfDay(r.started_at)}
                      </span>
                      {r.mode === 'dry_run' ? (
                        <span className="chip bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40">
                          dry run
                        </span>
                      ) : null}
                      {r.status === 'running' ? (
                        <span className="font-mono text-[11px] text-ink-500">
                          phase: {r.phase}
                        </span>
                      ) : null}
                      <span className="ml-auto text-xs text-ink-500">
                        {pennies(r.cost_pennies)} · {ago(r.started_at)}
                      </span>
                    </div>
                    {r.summary ? (
                      <p className="mt-1 truncate text-sm text-ink-400">{r.summary}</p>
                    ) : null}
                    {r.error ? <p className="mt-1 text-sm text-red-300">{r.error}</p> : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
