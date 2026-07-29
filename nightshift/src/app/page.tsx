import Link from 'next/link'
import { approveAction, rejectAction } from '@/app/actions'
import { HealthBadge, HealthDot } from '@/components/HealthBadge'
import { Markdown } from '@/components/Markdown'
import { Nav } from '@/components/Nav'
import { BlockingSetupScreen, SetupNotice } from '@/components/SetupNotice'
import { db } from '@/lib/db'
import { isConfigured } from '@/lib/env'
import { ago, pennies, plural, shortDate } from '@/lib/format'
import { specFor } from '@/lib/guardrails'
import { HEALTH_ORDER, type Action, type Brief, type Decision, type Project, type Run } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * The command deck — the page you look at with a coffee.
 *
 * Order is the whole design: last night's brief, then anything that needs a
 * decision from you, then the state of everything. If you read only the top
 * third you should still know whether today needs rearranging.
 */
export default async function CommandDeck() {
  if (!isConfigured()) return <BlockingSetupScreen />

  const [briefRes, decisionsRes, actionsRes, projectsRes, runsRes] = await Promise.all([
    db().from('briefs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    db()
      .from('decisions')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    db()
      .from('actions')
      .select('*')
      .in('status', ['proposed', 'approved'])
      .order('created_at', { ascending: false })
      .limit(25),
    db().from('projects').select('*').neq('status', 'archived'),
    db().from('runs').select('*').order('started_at', { ascending: false }).limit(1),
  ])

  const brief = briefRes.data as Brief | null
  // Urgency is a text column, so it can't be ordered meaningfully in the
  // query — rank it here so anything urgent sits at the top of "needs you".
  const URGENCY_RANK: Record<string, number> = { high: 0, normal: 1, low: 2 }
  const decisions = ((decisionsRes.data ?? []) as Decision[]).sort(
    (a, b) => (URGENCY_RANK[a.urgency] ?? 1) - (URGENCY_RANK[b.urgency] ?? 1),
  )
  const pending = (actionsRes.data ?? []) as Action[]
  const projects = (projectsRes.data ?? []) as Project[]
  const lastRun = ((runsRes.data ?? [])[0] ?? null) as Run | null

  const names = new Map(projects.map((p) => [p.id, p.name]))
  const sorted = [...projects].sort(
    (a, b) =>
      HEALTH_ORDER.indexOf(a.health) - HEALTH_ORDER.indexOf(b.health) ||
      a.priority - b.priority ||
      a.name.localeCompare(b.name),
  )
  const needsYou = decisions.length + pending.length

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        <SetupNotice />

        {/* ── The brief ─────────────────────────────────────────── */}
        <section className="panel overflow-hidden">
          <div className="panel-head">
            <span className="panel-title">Last night</span>
            {lastRun ? (
              <span className="text-xs text-ink-500">
                {shortDate(lastRun.started_at)} · {ago(lastRun.started_at)} ·{' '}
                {pennies(lastRun.cost_pennies)}
                {lastRun.status === 'failed' ? ' · failed' : ''}
                {lastRun.status === 'running' ? ' · still running' : ''}
              </span>
            ) : null}
          </div>

          <div className="px-5 py-5">
            {brief ? (
              <>
                <h1 className="mb-4 text-xl font-semibold leading-snug tracking-tight text-ink-100">
                  {brief.headline}
                </h1>
                <Markdown source={brief.body_md} />
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-ink-300">No brief yet.</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">
                  {projects.length === 0
                    ? 'Add a project or two and the crew will have something to work on tonight.'
                    : 'Press “Run now” to watch a shift happen, or wait for the nightly job.'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Needs you ─────────────────────────────────────────── */}
        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">Needs you</span>
            <span className="text-xs text-ink-500">
              {needsYou === 0 ? 'nothing right now' : plural(needsYou, 'item')}
            </span>
          </div>

          {needsYou === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500">
              Nothing is waiting on a decision. The crew got through the night on its own.
            </p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {decisions.map((d) => (
                <li key={d.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/25">
                      Question
                    </span>
                    {d.urgency === 'high' ? (
                      <span className="chip bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/25">
                        Urgent
                      </span>
                    ) : null}
                    <span className="text-xs text-ink-500">
                      {names.get(d.project_id ?? '') ?? 'General'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink-100">{d.question}</p>
                  {d.context ? (
                    <p className="mt-1 text-sm text-ink-400">{d.context}</p>
                  ) : null}
                  <Link
                    href="/decisions"
                    className="mt-2 inline-block text-xs text-ink-400 underline decoration-ink-600 underline-offset-2 hover:text-ink-100"
                  >
                    Answer this
                  </Link>
                </li>
              ))}

              {pending.map((a) => {
                const spec = specFor(a.kind)
                return (
                  <li key={a.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`chip ${
                          a.risk === 'high'
                            ? 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/25'
                            : 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25'
                        }`}
                      >
                        {a.risk} risk
                      </span>
                      <span className="text-xs text-ink-500">
                        {names.get(a.project_id ?? '') ?? 'General'}
                      </span>
                      {a.status === 'approved' ? (
                        <span className="chip bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25">
                          Approved — runs tonight
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm font-medium text-ink-100">{a.title}</p>
                    {a.rationale ? (
                      <p className="mt-1 text-sm text-ink-400">{a.rationale}</p>
                    ) : null}
                    {spec ? (
                      <p className="mt-1 text-xs text-ink-500">{spec.describes}</p>
                    ) : null}

                    {a.status === 'proposed' ? (
                      <div className="mt-3 flex gap-2">
                        <form action={approveAction}>
                          <input type="hidden" name="action_id" value={a.id} />
                          <button className="btn" type="submit">
                            Approve
                          </button>
                        </form>
                        <form action={rejectAction}>
                          <input type="hidden" name="action_id" value={a.id} />
                          <button className="btn btn-quiet" type="submit">
                            Reject
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* ── Everything you're running ─────────────────────────── */}
        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">Your projects</span>
            <Link href="/projects" className="text-xs text-ink-400 hover:text-ink-100">
              Manage
            </Link>
          </div>

          {sorted.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500">
              No projects yet.{' '}
              <Link href="/projects" className="underline underline-offset-2 hover:text-ink-100">
                Add the first one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {sorted.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3 transition hover:bg-ink-850"
                  >
                    <HealthDot health={p.health} />
                    <span className="font-medium text-ink-100">{p.name}</span>
                    <HealthBadge health={p.health} />
                    {p.status === 'paused' ? (
                      <span className="chip bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40">
                        Paused
                      </span>
                    ) : null}
                    <span className="ml-auto text-xs text-ink-500">
                      active {ago(p.last_activity_at)}
                    </span>
                  </Link>
                  {p.health_note ? (
                    <p className="px-5 pb-3 pl-[2.1rem] text-sm text-ink-400">{p.health_note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
