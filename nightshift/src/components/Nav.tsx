import Link from 'next/link'
import { logOut, triggerRun } from '@/app/actions'
import { autonomyLevel, env } from '@/lib/env'

const LINKS = [
  { href: '/', label: 'Command deck' },
  { href: '/projects', label: 'Projects' },
  { href: '/decisions', label: 'Needs you' },
  { href: '/runs', label: 'Runs' },
  { href: '/crew', label: 'Crew' },
]

const AUTONOMY_COPY: Record<string, string> = {
  dry_run: 'Dry run — nothing is executed',
  low_risk_live: 'Low-risk actions run automatically',
  full_live: 'Low and medium-risk actions run automatically',
}

export function Nav() {
  const level = autonomyLevel()

  return (
    <header className="border-b border-ink-800 bg-ink-900/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-ink-100">Nightshift</span>
          <span className="hidden text-[11px] text-ink-500 sm:inline">
            {env.timezone}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1 text-sm text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span
            title={AUTONOMY_COPY[level]}
            className={`chip ${
              level === 'dry_run'
                ? 'bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40'
                : 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25'
            }`}
          >
            {level === 'dry_run' ? 'Dry run' : 'Live'}
          </span>
          <form action={triggerRun}>
            <button className="btn btn-primary" type="submit">
              Run now
            </button>
          </form>
          {env.dashboardPassword ? (
            <form action={logOut}>
              <button className="btn btn-quiet" type="submit">
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  )
}
