import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Markdown } from '@/components/Markdown'
import { Nav } from '@/components/Nav'
import { BlockingSetupScreen } from '@/components/SetupNotice'
import { db } from '@/lib/db'
import { isConfigured } from '@/lib/env'
import { pennies, shortDate, timeOfDay } from '@/lib/format'
import type { Action, Brief, Observation, Project, Run } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * One night, in full. Useful when the brief says something surprising and you
 * want to see exactly which observation led to it.
 */
export default async function RunPage({ params }: { params: { id: string } }) {
  if (!isConfigured()) return <BlockingSetupScreen />

  const { data: runRow } = await db().from('runs').select('*').eq('id', params.id).maybeSingle()
  if (!runRow) notFound()
  const run = runRow as Run

  const [briefRes, obsRes, actRes, projRes] = await Promise.all([
    db().from('briefs').select('*').eq('run_id', run.id).maybeSingle(),
    db()
      .from('observations')
      .select('*')
      .eq('run_id', run.id)
      .order('observed_at', { ascending: true }),
    db().from('actions').select('*').eq('run_id', run.id).order('created_at', { ascending: true }),
    db().from('projects').select('id, name'),
  ])

  const brief = briefRes.data as Brief | null
  const observations = (obsRes.data ?? []) as Observation[]
  const actions = (actRes.data ?? []) as Action[]
  const names = new Map(
    ((projRes.data ?? []) as Pick<Project, 'id' | 'name'>[]).map((p) => [p.id, p.name]),
  )

  const grouped = new Map<string, Observation[]>()
  for (const o of observations) {
    const key = names.get(o.project_id ?? '') ?? 'General'
    grouped.set(key, [...(grouped.get(key) ?? []), o])
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
        <div>
          <Link href="/runs" className="text-xs text-ink-500 hover:text-ink-200">
            ← All runs
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {shortDate(run.started_at)} at {timeOfDay(run.started_at)}
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            {run.status} · {run.mode === 'dry_run' ? 'dry run' : 'live'} · triggered by{' '}
            {run.trigger} · {pennies(run.cost_pennies)} · {run.input_tokens.toLocaleString()} in /{' '}
            {run.output_tokens.toLocaleString()} out
          </p>
          {run.error ? (
            <p className="mt-2 rounded-md border border-red-500/25 bg-red-500/[0.06] px-3 py-2 text-sm text-red-200">
              {run.error}
            </p>
          ) : null}
          {run.status === 'running' ? (
            <p className="mt-2 rounded-md border border-sky-500/25 bg-sky-500/[0.06] px-3 py-2 text-sm text-sky-200">
              Still in flight — currently in the {run.phase} phase. It will pick up on the next
              tick, or you can press &ldquo;Run now&rdquo; to push it along.
            </p>
          ) : null}
        </div>

        {brief ? (
          <section className="panel">
            <div className="panel-head">
              <span className="panel-title">The brief</span>
            </div>
            <div className="px-5 py-5">
              <h2 className="mb-3 text-lg font-semibold leading-snug">{brief.headline}</h2>
              <Markdown source={brief.body_md} />
            </div>
          </section>
        ) : null}

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">What the crew did</span>
            <span className="text-xs text-ink-500">{actions.length} actions</span>
          </div>
          {actions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500">No actions were proposed.</p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {actions.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm text-ink-100">{a.title}</span>
                    <span className="font-mono text-[11px] text-ink-500">{a.kind}</span>
                    <span className="ml-auto text-xs text-ink-500">
                      {names.get(a.project_id ?? '') ?? 'General'} · {a.status}
                    </span>
                  </div>
                  {a.result?.detail ? (
                    <p className="mt-1 text-xs text-ink-500">{String(a.result.detail)}</p>
                  ) : null}
                  {a.result?.queued_because ? (
                    <p className="mt-1 text-xs text-amber-300/70">
                      {String(a.result.queued_because)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">What the crew saw</span>
            <span className="text-xs text-ink-500">{observations.length} observations</span>
          </div>
          {observations.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500">Nothing was observed.</p>
          ) : (
            <div className="divide-y divide-ink-800">
              {Array.from(grouped.entries()).map(([project, items]) => (
                <div key={project} className="px-5 py-4">
                  <p className="mb-2 text-sm font-medium text-ink-200">{project}</p>
                  <ul className="space-y-1.5">
                    {items.map((o) => (
                      <li key={o.id} className="text-sm text-ink-400">
                        <span className="font-mono text-[11px] uppercase text-ink-500">
                          {o.kind}
                        </span>{' '}
                        {o.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
