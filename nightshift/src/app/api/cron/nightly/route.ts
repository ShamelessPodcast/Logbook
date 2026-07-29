import { NextResponse } from 'next/server'
import { cronAuthorised } from '@/lib/auth'
import { isConfigured } from '@/lib/env'
import { findResumableRun, reapStaleRuns, resumeRun, startRun } from '@/lib/orchestrator'

/**
 * The nightly run.
 *
 * Fires once a night from Vercel Cron. If a previous night somehow left a run
 * in flight, it finishes that first rather than starting a second one —
 * two concurrent runs would both write observations for the same evening.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Vercel Pro allows up to 300s. The orchestrator checkpoints below this.
export const maxDuration = 300

async function handle(request: Request) {
  if (!cronAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'Nightshift is not configured. Set the Supabase environment variables.' },
      { status: 503 },
    )
  }

  const reaped = await reapStaleRuns()

  const inFlight = await findResumableRun()
  const outcome = inFlight ? await resumeRun(inFlight) : await startRun('cron')

  return NextResponse.json({
    ...outcome,
    resumed: Boolean(inFlight),
    stale_runs_reaped: reaped,
  })
}

export const GET = handle
export const POST = handle
