import { NextResponse } from 'next/server'
import { cronAuthorised } from '@/lib/auth'
import { isConfigured } from '@/lib/env'
import { findResumableRun, reapStaleRuns, resumeRun } from '@/lib/orchestrator'

/**
 * The resume tick.
 *
 * Runs every twenty minutes for a couple of hours after the nightly job.
 * If there's an unfinished run, it pushes it further along; if not, it does
 * nothing and costs nothing. This is what stops a large project list from
 * being capped by one serverless invocation's wall clock.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function handle(request: Request) {
  if (!cronAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  if (!isConfigured()) {
    return NextResponse.json({ error: 'Nightshift is not configured.' }, { status: 503 })
  }

  await reapStaleRuns()

  const inFlight = await findResumableRun()
  if (!inFlight) {
    return NextResponse.json({ idle: true, message: 'Nothing in flight.' })
  }

  const outcome = await resumeRun(inFlight)
  return NextResponse.json({ idle: false, ...outcome })
}

export const GET = handle
export const POST = handle
