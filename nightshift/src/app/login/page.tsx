import { redirect } from 'next/navigation'
import { logIn } from '@/app/actions'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // Nothing to log into if no password is configured.
  if (!env.dashboardPassword) redirect('/')

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form action={logIn} className="panel w-full max-w-sm space-y-4 p-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Nightshift</h1>
          <p className="mt-1 text-sm text-ink-400">
            Your crew has been working. Sign in to see what they did.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            className="field"
          />
        </div>

        {searchParams.error ? (
          <p className="text-sm text-red-300">That password didn&rsquo;t match.</p>
        ) : null}

        <button className="btn btn-primary w-full justify-center" type="submit">
          Sign in
        </button>
      </form>
    </main>
  )
}
