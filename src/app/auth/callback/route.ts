import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Supabase sends error params when e.g. the OTP link has expired
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')

  if (error) {
    const message =
      errorCode === 'otp_expired'
        ? 'link_expired'
        : errorCode === 'access_denied'
          ? 'access_denied'
          : 'auth_error'
    return NextResponse.redirect(`${origin}/login?message=${message}`)
  }

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/feed'

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?message=auth_error`)
}
