/**
 * Smoke test for the parts that don't need a database or an API key: the
 * guardrails, the action catalogue, and the brief renderer.
 *
 *   npx tsx scripts/smoke.ts
 *
 * These are the pieces where a mistake is dangerous rather than merely
 * annoying, so they get checked without needing any credentials.
 */

import { ACTION_KINDS, isKnownKind, mayExecute, riskOf } from '../src/lib/guardrails'

let failures = 0

function check(name: string, condition: boolean) {
  if (condition) {
    console.log(`  ok    ${name}`)
  } else {
    console.log(`  FAIL  ${name}`)
    failures += 1
  }
}

console.log('\nGuardrails')

check(
  'an invented action kind is rejected',
  !isKnownKind('send_email') && !mayExecute('send_email', 'full_live').allowed,
)

check(
  'unknown kinds default to high risk',
  riskOf('transfer_all_the_money') === 'high',
)

check(
  'dry run executes nothing',
  ACTION_KINDS.every((k) => !mayExecute(k.kind, 'dry_run').allowed),
)

check(
  'high risk never runs automatically, at any level',
  (['dry_run', 'low_risk_live', 'full_live'] as const).every((level) =>
    ACTION_KINDS.filter((k) => k.risk === 'high').every((k) => !mayExecute(k.kind, level).allowed),
  ),
)

check(
  'low_risk_live runs low risk and queues medium',
  ACTION_KINDS.filter((k) => k.risk === 'low').every(
    (k) => mayExecute(k.kind, 'low_risk_live').allowed,
  ) &&
    ACTION_KINDS.filter((k) => k.risk === 'medium').every(
      (k) => !mayExecute(k.kind, 'low_risk_live').allowed,
    ),
)

check(
  'full_live runs medium risk',
  ACTION_KINDS.filter((k) => k.risk === 'medium').every(
    (k) => mayExecute(k.kind, 'full_live').allowed,
  ),
)

check(
  'the catalogue contains nothing that reaches outside the system',
  ACTION_KINDS.every((k) => !/send|email|delete|pay|charge|post_to/.test(k.kind) || k.risk === 'high'),
)

console.log('\nEvery permitted action, at the default autonomy level:')
for (const k of ACTION_KINDS) {
  const v = mayExecute(k.kind, 'low_risk_live')
  console.log(`  ${v.allowed ? 'auto ' : 'queue'} ${k.kind.padEnd(24)} ${k.risk}`)
}

console.log(
  failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`,
)
process.exit(failures === 0 ? 0 : 1)
