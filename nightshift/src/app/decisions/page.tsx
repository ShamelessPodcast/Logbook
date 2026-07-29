import { answerDecision, approveAction, dismissDecision, rejectAction } from '@/app/actions'
import { Nav } from '@/components/Nav'
import { BlockingSetupScreen } from '@/components/SetupNotice'
import { db } from '@/lib/db'
import { isConfigured } from '@/lib/env'
import { ago } from '@/lib/format'
import { specFor } from '@/lib/guardrails'
import type { Action, Decision, Project } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * The approval queue. Everything the crew decided it shouldn't decide alone,
 * in one place, answerable without leaving the page.
 */
export default async function DecisionsPage() {
  if (!isConfigured()) return <BlockingSetupScreen />

  const [decisionsRes, actionsRes, projectsRes, answeredRes] = await Promise.all([
    db().from('decisions').select('*').eq('status', 'open').order('created_at', { ascending: false }),
    db()
      .from('actions')
      .select('*')
      .in('status', ['proposed', 'approved'])
      .order('created_at', { ascending: false }),
    db().from('projects').select('id, name'),
    db()
      .from('decisions')
      .select('*')
      .neq('status', 'open')
      .order('answered_at', { ascending: false })
      .limit(10),
  ])

  const decisions = (decisionsRes.data ?? []) as Decision[]
  const actions = (actionsRes.data ?? []) as Action[]
  const answered = (answeredRes.data ?? []) as Decision[]
  const names = new Map(
    ((projectsRes.data ?? []) as Pick<Project, 'id' | 'name'>[]).map((p) => [p.id, p.name]),
  )

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Needs you</h1>
          <p className="mt-1 text-sm text-ink-400">
            The crew raises a question rather than guessing. Answers feed straight back into
            tonight&rsquo;s run.
          </p>
        </div>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">Questions</span>
            <span className="text-xs text-ink-500">{decisions.length}</span>
          </div>

          {decisions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500">Nothing outstanding.</p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {decisions.map((d) => (
                <li key={d.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
                    <span>{names.get(d.project_id ?? '') ?? 'General'}</span>
                    <span>·</span>
                    <span>{ago(d.created_at)}</span>
                    {d.urgency === 'high' ? (
                      <span className="chip bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/25">
                        Urgent
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-[15px] font-medium text-ink-100">{d.question}</p>
                  {d.context ? <p className="mt-1 text-sm text-ink-400">{d.context}</p> : null}

                  {d.options.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {d.options.map((o, i) => (
                        <li key={i} className="text-sm text-ink-300">
                          <span className="text-ink-500">{i + 1}.</span> {o.label}
                          {o.consequence ? (
                            <span className="text-ink-500"> — {o.consequence}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <form action={answerDecision} className="mt-3 flex flex-wrap gap-2">
                    <input type="hidden" name="decision_id" value={d.id} />
                    <input
                      name="answer"
                      required
                      className="field flex-1 min-w-[16rem]"
                      placeholder="Your answer — the crew reads this tonight."
                    />
                    <button className="btn btn-primary" type="submit">
                      Answer
                    </button>
                  </form>
                  <form action={dismissDecision} className="mt-2">
                    <input type="hidden" name="decision_id" value={d.id} />
                    <button className="btn-quiet rounded px-1 text-xs" type="submit">
                      Dismiss — this doesn&rsquo;t need answering
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">Actions awaiting approval</span>
            <span className="text-xs text-ink-500">{actions.length}</span>
          </div>

          {actions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500">
              Nothing queued. Everything the crew proposed was within its autonomy level.
            </p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {actions.map((a) => {
                const spec = specFor(a.kind)
                return (
                  <li key={a.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
                      <span>{names.get(a.project_id ?? '') ?? 'General'}</span>
                      <span>·</span>
                      <span className="font-mono">{a.kind}</span>
                      <span
                        className={`chip ${
                          a.risk === 'high'
                            ? 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/25'
                            : 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25'
                        }`}
                      >
                        {a.risk} risk
                      </span>
                    </div>

                    <p className="mt-2 text-[15px] font-medium text-ink-100">{a.title}</p>
                    {a.rationale ? (
                      <p className="mt-1 text-sm text-ink-400">{a.rationale}</p>
                    ) : null}
                    {spec ? <p className="mt-1 text-xs text-ink-500">{spec.describes}</p> : null}
                    {a.result?.queued_because ? (
                      <p className="mt-1 text-xs text-ink-500">
                        Held back: {String(a.result.queued_because)}
                      </p>
                    ) : null}

                    {a.kind === 'draft_external_message' && a.payload.body ? (
                      <pre className="mt-2 whitespace-pre-wrap rounded-md border border-ink-800 bg-ink-950 p-3 text-sm text-ink-300">
                        {String(a.payload.body)}
                      </pre>
                    ) : null}

                    {a.status === 'approved' ? (
                      <p className="mt-3 text-sm text-emerald-300">
                        Approved. The Operator will carry this out on the next run.
                      </p>
                    ) : (
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
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {answered.length > 0 ? (
          <section className="panel">
            <div className="panel-head">
              <span className="panel-title">Recently answered</span>
            </div>
            <ul className="divide-y divide-ink-800">
              {answered.map((d) => (
                <li key={d.id} className="px-5 py-3">
                  <p className="text-sm text-ink-300">{d.question}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {d.status === 'dismissed' ? 'Dismissed' : `You said: ${d.answer}`}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  )
}
