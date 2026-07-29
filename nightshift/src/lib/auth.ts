import { env } from './env'

/**
 * Two doors, two locks.
 *
 * The cron endpoints are protected by a shared secret. The dashboard is
 * protected by a password cookie. Neither is sophisticated; both are enough
 * to stop the internet at large triggering your agents or reading your
 * project list.
 */

export function cronAuthorised(request: Request): boolean {
  // No secret configured is a stated risk, surfaced on the dashboard.
  if (!env.cronSecret) return true

  const header = request.headers.get('authorization')
  if (header === `Bearer ${env.cronSecret}`) return true

  // Vercel Cron sends the secret this way too, depending on configuration.
  const url = new URL(request.url)
  return url.searchParams.get('secret') === env.cronSecret
}

export const SESSION_COOKIE = 'nightshift_session'

/**
 * Deliberately not a JWT. The cookie value is the password itself, checked
 * on every request against the env var — so revoking access is a matter of
 * changing one environment variable, with no session store to invalidate.
 */
export function dashboardAuthorised(cookieValue: string | undefined): boolean {
  if (!env.dashboardPassword) return true
  return cookieValue === env.dashboardPassword
}
