import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addSource, removeSource, setProjectStatus } from '@/app/actions'
import { HealthBadge } from '@/components/HealthBadge'
import { Nav } from '@/components/Nav'
import { BlockingSetupScreen } from '@/components/SetupNotice'
import { db } from '@/lib/db'
import { isConfigured } from '@/lib/env'
import { ago, shortDate } from '@/lib/format'
import type { Action, Decision, Observation, Project, ProjectSource } from '@/lib/types'

export const dynamic = 'force-dynamic'

const KIND_STYLE: Record<string, string> = {
  progress: 'text-emerald-300',
  risk: 'text-amber-300',
  blocker: 'text-red-300',
  idle: 'text-ink-400',
  signal: 'text-ink-300',
}

const SOURCE_HINT: Record<string, string> = {
  github_repo: 'owner/name — commits, pull requests and open issues',
  url: 'https://… — checks it is up and notices content changes',
  note: 'Free text the crew should keep in mind every night',
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  if (!isConfigured()) return <BlockingSetupScreen />

  const { data: projectRow } = await db()
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!projectRow) notFound()
  const project = projectRow as Project

  const [sourcesRes, observationsRes, actionsRes, decisionsRes] = await Promise.all([
    db().from('project_sources').select('*').eq('project_id', project.id),
    db()
      .from('observations')
      .select('*')
      .eq('project_id', project.id)
      .order('observed_at', { ascending: false })
      .limit(60),
    db()
      .from('actions')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(30),
    db()
      .from('decisions')
      .select('*')
      .eq('project_id', project.id)
      .eq('status', 'open'),
  ])

  const sources = (sourcesRes.data ?? []) as ProjectSource[]
  const observations = (observationsRes.data ?? []) as Observation[]
  const actions = (actionsRes.data ?? []) as Action[]
  const decisions = (decisionsRes.data ?? []) as Decision[]

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        <div>
          <Link href="/projects" className="text-xs text-ink-500 hover:text-ink-200">
            ← All projects
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <HealthBadge health={project.health} />
            <form action={setProjectStatus} className="ml-auto">
              <input type="hidden" name="project_id" value={project.id} />
              <input
                type="hidden"
                name="status"
                value={project.status === 'active' ? 'paused' : 'active'}
              />
              <button className="btn btn-quiet" type="submit">
                {project.status === 'active' ? 'Pause reviews' : 'Resume reviews'}
              </button>
            </form>
          </div>
          {project.health_note ? (
            <p className="mt-2 text-sm text-ink-300">{project.health_note}</p>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            {decisions.length > 0 ? (
              <section className="panel border-sky-500/25">
                <div className="panel-head">
                  <span className="panel-title">Waiting on you</span>
                </div>
                <ul className="divide-y divide-ink-800">
                  {decisions.map((d) => (
                    <li key={d.id} className="px-5 py-3">
                      <p className="text-sm font-medium text-ink-100">{d.question}</p>
                      {d.context ? (
                        <p className="mt-1 text-sm text-ink-400">{d.context}</p>
                      ) : null}
                      <Link
                        href="/decisions"
                        className="mt-1.5 inline-block text-xs text-ink-400 underline underline-offset-2 hover:text-ink-100"
                      >
                        Answer
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="panel">
              <div className="panel-head">
                <span className="panel-title">Timeline</span>
                <span className="text-xs text-ink-500">{observations.length} observations</span>
              </div>
              {observations.length === 0 ? (
                <p className="px-5 py-6 text-sm text-ink-500">
                  Nothing observed yet. Add a source and run a shift.
                </p>
              ) : (
                <ul className="divide-y divide-ink-800">
                  {observations.map((o) => (
                    <li key={o.id} className="px-5 py-3">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span
                          className={`font-mono text-[11px] uppercase tracking-wider ${
                            KIND_STYLE[o.kind] ?? 'text-ink-300'
                          }`}
                        >
                          {o.kind}
                        </span>
                        <span className="text-sm text-ink-100">{o.title}</span>
                        <span className="ml-auto text-xs text-ink-500">
                          {shortDate(o.observed_at)}
                        </span>
                      </div>
                      {o.detail ? (
                        <p className="mt-1 text-sm text-ink-400">{o.detail}</p>
                      ) : null}
                      {o.evidence.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                          {o.evidence.slice(0, 6).map((e, i) =>
                            e.url ? (
                              <a
                                key={i}
                                href={e.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="font-mono text-[11px] text-ink-500 underline decoration-ink-700 underline-offset-2 hover:text-ink-200"
                              >
                                {e.label}
                              </a>
                            ) : (
                              <span key={i} className="font-mono text-[11px] text-ink-500">
                                {e.label}
                              </span>
                            ),
                          )}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <span className="panel-title">Actions taken</span>
              </div>
              {actions.length === 0 ? (
                <p className="px-5 py-6 text-sm text-ink-500">No actions yet.</p>
              ) : (
                <ul className="divide-y divide-ink-800">
                  {actions.map((a) => (
                    <li key={a.id} className="px-5 py-3">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm text-ink-100">{a.title}</span>
                        <span
                          className={`chip ${
                            a.status === 'executed'
                              ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25'
                              : a.status === 'failed'
                                ? 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/25'
                                : 'bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40'
                          }`}
                        >
                          {a.status}
                        </span>
                        <span className="ml-auto font-mono text-[11px] text-ink-500">
                          {a.kind}
                        </span>
                      </div>
                      {a.rationale ? (
                        <p className="mt-1 text-sm text-ink-400">{a.rationale}</p>
                      ) : null}
                      {a.result?.detail ? (
                        <p className="mt-1 text-xs text-ink-500">{String(a.result.detail)}</p>
                      ) : null}
                      {Array.isArray(a.result?.tasks) ? (
                        <ul className="mt-2 space-y-1">
                          {(a.result.tasks as string[]).map((t, i) => (
                            <li key={i} className="text-sm text-ink-300">
                              ☐ {t}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="panel">
              <div className="panel-head">
                <span className="panel-title">Goal</span>
              </div>
              <div className="space-y-3 p-4 text-sm">
                <p className={project.goal ? 'text-ink-200' : 'text-amber-300/70'}>
                  {project.goal ?? 'No goal recorded. The crew will keep flagging this.'}
                </p>
                {project.summary ? (
                  <p className="text-ink-400">{project.summary}</p>
                ) : null}
                <dl className="space-y-1.5 border-t border-ink-800 pt-3 text-xs text-ink-500">
                  <div className="flex justify-between gap-3">
                    <dt>Next milestone</dt>
                    <dd className="text-right text-ink-300">
                      {project.next_milestone ?? '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Priority</dt>
                    <dd className="text-ink-300">{project.priority}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Last activity</dt>
                    <dd className="text-ink-300">{ago(project.last_activity_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Last reviewed</dt>
                    <dd className="text-ink-300">{ago(project.last_reviewed_at)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <span className="panel-title">Sources</span>
              </div>

              {sources.length > 0 ? (
                <ul className="divide-y divide-ink-800">
                  {sources.map((s) => (
                    <li key={s.id} className="flex items-start gap-2 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-200">{s.label ?? s.kind}</p>
                        <p className="font-mono text-[11px] text-ink-500">{s.kind}</p>
                        {s.last_error ? (
                          <p className="mt-1 text-xs text-red-300">{s.last_error}</p>
                        ) : null}
                      </div>
                      <form action={removeSource}>
                        <input type="hidden" name="source_id" value={s.id} />
                        <input type="hidden" name="slug" value={project.slug} />
                        <button className="btn-quiet rounded px-1.5 py-0.5 text-xs" type="submit">
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-ink-500">
                  No sources. Without one the crew has nothing to look at and will report this
                  project as unknown every night.
                </p>
              )}

              <form action={addSource} className="space-y-3 border-t border-ink-800 p-4">
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="slug" value={project.slug} />
                <div>
                  <label className="label" htmlFor="kind">
                    Add a source
                  </label>
                  <select id="kind" name="kind" defaultValue="github_repo" className="field">
                    <option value="github_repo">GitHub repository</option>
                    <option value="url">Live URL</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div>
                  <input
                    name="value"
                    required
                    className="field"
                    placeholder="ShamelessPodcast/Logbook"
                  />
                  <p className="mt-1.5 text-xs text-ink-500">{SOURCE_HINT.github_repo}</p>
                </div>
                <button className="btn w-full justify-center" type="submit">
                  Add source
                </button>
              </form>
            </section>
          </aside>
        </div>
      </main>
    </>
  )
}
