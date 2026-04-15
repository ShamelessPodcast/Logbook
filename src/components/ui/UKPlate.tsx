import { cn } from '@/utils/cn'
import { formatReg } from '@/utils/plate'

interface UKPlateProps {
  registration: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs font-bold tracking-wider',
  md: 'px-3 py-1 text-sm font-bold tracking-wider',
  lg: 'px-4 py-2 text-base font-bold tracking-widest',
}

/**
 * Renders a UK number plate badge — black text on yellow background,
 * with the characteristic Charles Wright font approximated using
 * font-mono + tracking.
 */
export function UKPlate({ registration, size = 'md', className }: UKPlateProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border-2 border-neutral-800 bg-yellow-300 font-mono text-neutral-900',
        sizes[size],
        className
      )}
      aria-label={`Number plate: ${registration}`}
    >
      {formatReg(registration)}
    </span>
  )
}
