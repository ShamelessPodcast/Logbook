import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

/**
 * Gate the dashboard behind the password cookie.
 *
 * Cron routes are excluded — they carry their own shared secret and are
 * called by Vercel, which has no cookie. The login page is excluded for
 * obvious reasons.
 *
 * The env var is read here rather than through `@/lib/env` because
 * middleware runs on the edge runtime, where that module's Node assumptions
 * don't hold.
 */
export function middleware(request: NextRequest) {
  const password = process.env.NIGHTSHIFT_PASSWORD?.trim()
  if (!password) return NextResponse.next()

  const cookie = request.cookies.get(SESSION_COOKIE)?.value
  if (cookie === password) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!login|api/cron|_next/static|_next/image|favicon.ico).*)'],
}
