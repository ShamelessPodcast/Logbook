/**
 * Run a shift from the terminal.
 *
 *   npm run nightshift:run
 *
 * Same code path the cron job takes, so if it works here it works at 2am.
 * Loops until the run finishes, since a large project list checkpoints and
 * resumes rather than doing everything in one pass.
 */

import { configProblems, isConfigured } from '../src/lib/env'
import { findResumableRun, resumeRun, startRun } from '../src/lib/orchestrator'

async function main() {
  for (const problem of configProblems()) {
    const prefix = problem.blocking ? 'MISSING' : 'note'
    console.log(`${prefix}: ${problem.key} — ${problem.detail}`)
  }

  if (!isConfigured()) {
    console.error('\nCannot run without a database. See the notes above.')
    process.exit(1)
  }

  console.log('\nStarting a shift...\n')

  let outcome = await startRun('manual')
  let passes = 1

  while (!outcome.finished && passes < 20) {
    console.log(`\n--- ${outcome.summary} Resuming (pass ${passes + 1})...\n`)
    const run = await findResumableRun()
    if (!run) break
    outcome = await resumeRun(run)
    passes += 1
  }

  console.log(`\n${outcome.status.toUpperCase()} — ${outcome.summary}`)
  console.log(`Run id: ${outcome.runId}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
