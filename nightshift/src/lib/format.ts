import { formatDistanceToNowStrict } from 'date-fns'

export function ago(iso: string | null | undefined): string {
  if (!iso) return 'never'
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return 'unknown'
  return `${formatDistanceToNowStrict(new Date(ms))} ago`
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeOfDay(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function pennies(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  if (n === 0) return 'free'
  if (n < 100) return `${n.toFixed(1)}p`
  return `£${(n / 100).toFixed(2)}`
}

export function plural(count: number, one: string, many?: string): string {
  return `${count} ${count === 1 ? one : (many ?? `${one}s`)}`
}
