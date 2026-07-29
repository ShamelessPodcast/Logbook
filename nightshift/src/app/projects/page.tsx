import Link from 'next/link'
import { createProject } from '@/app/actions'
import { HealthBadge } from '@/components/HealthBadge'
import { Nav } from '@/components/Nav'
import { BlockingSetupScreen } from '@/components/SetupNotice'
import { db } from '@/lib/db'
import { isConfigured } from '@/lib/env'
import { ago } from '@/lib/format'
import { HEALTH_ORDER, type Project } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  if (!isConfigured()) return <BlockingSetupScreen />

  const { data } = await db().from('projects').select('*')
  const projects = ((data ?? []) as Project[]).sort(
    (a, b) =>
      HEALTH_ORDER.indexOf(a.health) - HEALTH_ORDER.indexOf(b.health) ||
      a.priority - b.priority ||
      a.name.localeCompare(b.name),
  )

  return (
    <>
      <Nav />
      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1fr_20rem]">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">All projects</span>
            <span className="text-xs text-ink-500">{projects.length}</span>
          </div>

          {projects.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-500">
              Nothing here yet. The form beside this one takes about twenty seconds.
            </p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="block px-5 py-4 transition hover:bg-ink-850"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink-100">{p.name}</span>
                      <HealthBadge health={p.health} />
                      {p.status !== 'active' ? (
                        <span className="chip bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40">
                          {p.status}
                        </span>
                      ) : null}
                      <span className="ml-auto text-xs text-ink-500">
                        reviewed {ago(p.last_reviewed_at)}
                      </span>
                    </div>
                    {p.goal ? (
                      <p className="mt-1.5 text-sm text-ink-400">{p.goal}</p>
                    ) : (
                      <p className="mt-1.5 text-sm text-amber-300/70">
                        No goal recorded — the crew will flag this.
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="panel h-fit">
          <div className="panel-head">
            <span className="panel-title">Add a project</span>
          </div>
          <form action={createProject} className="space-y-4 p-4">
            <div>
              <label className="label" htmlFor="name">
                Name
              </label>
              <input id="name" name="name" required className="field" placeholder="Logbook" />
            </div>

            <div>
              <label className="label" htmlFor="goal">
                What does winning look like?
              </label>
              <textarea
                id="goal"
                name="goal"
                rows={3}
                className="field"
                placeholder="500 signed-up users and a working plate-lock flow by September."
              />
              <p className="mt-1.5 text-xs text-ink-500">
                Be specific. The crew judges everything against this, so a vague goal produces
                vague work.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="summary">
                Background
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={2}
                className="field"
                placeholder="Anything the crew should know that isn't obvious from the sources."
              />
            </div>

            <div>
              <label className="label" htmlFor="priority">
                Priority
              </label>
              <select id="priority" name="priority" defaultValue="3" className="field">
                <option value="1">1 — most important</option>
                <option value="2">2</option>
                <option value="3">3 — normal</option>
                <option value="4">4</option>
                <option value="5">5 — background</option>
              </select>
            </div>

            <button className="btn btn-primary w-full justify-center" type="submit">
              Add project
            </button>
          </form>
        </aside>
      </main>
    </>
  )
}
