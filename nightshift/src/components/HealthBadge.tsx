import { HEALTH_LABEL, type Health } from '@/lib/types'

const STYLES: Record<Health, string> = {
  on_track: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25',
  at_risk: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25',
  stalled: 'bg-orange-500/10 text-orange-300 ring-1 ring-inset ring-orange-500/25',
  blocked: 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/25',
  unknown: 'bg-ink-700/40 text-ink-300 ring-1 ring-inset ring-ink-600/40',
}

export function HealthBadge({ health }: { health: Health }) {
  return <span className={`chip ${STYLES[health]}`}>{HEALTH_LABEL[health]}</span>
}

export function HealthDot({ health }: { health: Health }) {
  const colour: Record<Health, string> = {
    on_track: 'bg-emerald-400',
    at_risk: 'bg-amber-400',
    stalled: 'bg-orange-400',
    blocked: 'bg-red-400',
    unknown: 'bg-ink-500',
  }
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${colour[health]}`}
    />
  )
}
