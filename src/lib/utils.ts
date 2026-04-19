import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format pence to GBP string e.g. £12.50 */
export function formatCost(pence: number): string {
  return `£${(pence / 100).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Format a UK registration for display e.g. "BD51SMR" → "BD51 SMR" */
export function formatReg(reg: string): string {
  const clean = reg.replace(/\s/g, '').toUpperCase()
  // Modern format: AB12 CDE
  if (/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(clean)) {
    return `${clean.slice(0, 4)} ${clean.slice(4)}`
  }
  // Prefix format: A123 BCD
  if (/^[A-Z]\d{1,3}[A-Z]{3}$/.test(clean)) {
    const letters = clean.match(/^([A-Z])(\d+)([A-Z]{3})$/)
    if (letters) return `${letters[1]}${letters[2]} ${letters[3]}`
  }
  return clean
}

/** Truncate text to n chars with ellipsis */
export function truncate(text: string, n: number): string {
  return text.length > n ? text.slice(0, n).trimEnd() + '…' : text
}

/** Relative time: "2 hours ago", "just now" */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
