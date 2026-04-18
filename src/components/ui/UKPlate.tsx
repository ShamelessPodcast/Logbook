import { cn } from '@/utils/cn'
import { formatReg } from '@/utils/plate'

interface UKPlateProps {
  registration: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Size scale — Charles Wright font is tall; tracking is critical for authenticity
const sizes = {
  sm: 'px-1.5 py-px   text-[11px] tracking-[0.15em]',
  md: 'px-2.5 py-0.5  text-[13px] tracking-[0.175em]',
  lg: 'px-3.5 py-1    text-[16px] tracking-[0.2em]',
}

/**
 * Authentic UK number plate badge.
 * Yellow background (#F5C518), near-black border + text, mono font,
 * wide letter-spacing to approximate the Charles Wright typeface.
 */
export function UKPlate({ registration, size = 'md', className }: UKPlateProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[3px] border-2 font-mono font-bold select-none',
        'bg-[--plate-yellow] border-[--plate-border] text-[--plate-border]',
        sizes[size],
        className
      )}
      aria-label={`Number plate: ${registration}`}
    >
      {formatReg(registration)}
    </span>
  )
}
