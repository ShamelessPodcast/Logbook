import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, steps, url, userAgent } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get the user if logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Log to Sentry as a breadcrumb/issue
    Sentry.captureMessage(`[Bug Report] ${title}`, {
      level: 'info',
      user: user ? { id: user.id, email: user.email } : undefined,
      extra: {
        description,
        steps,
        reported_url: url,
        user_agent: userAgent,
      },
      tags: {
        type: 'user_bug_report',
      },
    })

    // Also store in Supabase for tracking
    await supabase.from('bug_reports').insert({
      title,
      description: description || null,
      steps: steps || null,
      reporter_id: user?.id || null,
      reported_url: url || null,
      user_agent: userAgent || null,
    }).throwOnError()

    return NextResponse.json({ ok: true })
  } catch {
    // Even if DB insert fails, Sentry already captured it
    return NextResponse.json({ ok: true })
  }
}
