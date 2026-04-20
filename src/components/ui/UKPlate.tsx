'use client'

import { cn } from '@/lib/utils'
import { formatReg } from '@/utils/plate'

interface UKPlateProps {
  registration: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'rear' | 'front'   // rear = yellow, front = white
  className?: string
}

const sizes = {
  sm: { plate: 'h-[22px] pl-[3px] pr-2 gap-[3px]', badge: 'w-[14px]', text: 'text-[11px] tracking-[0.12em]' },
  md: { plate: 'h-[32px] pl-[4px] pr-3 gap-[4px]', badge: 'w-[20px]', text: 'text-[15px] tracking-[0.14em]' },
  lg: { plate: 'h-[44px] pl-[6px] pr-4 gap-[5px]', badge: 'w-[28px]', text: 'text-[21px] tracking-[0.16em]' },
}

/**
 * Authentic UK number plate.
 * Rear (yellow) by default. Pass variant="front" for white.
 * Includes the GB badge with Union Flag and "UK" identifier.
 */
export function UKPlate({ registration, size = 'md', variant = 'rear', className }: UKPlateProps) {
  const s = sizes[size]
  const bg = variant === 'front' ? '#FFFFFF' : '#F5D000'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[3px] border border-[#222] select-none font-mono font-black',
        s.plate,
        className
      )}
      style={{ background: bg, letterSpacing: '0.12em' }}
      aria-label={`Number plate: ${registration}`}
    >
      {/* GB badge */}
      <span
        className={cn('flex flex-col items-center justify-center shrink-0 rounded-[2px] self-stretch py-0.5', s.badge)}
        style={{ background: '#003399' }}
      >
        {/* Union Flag — simplified inline SVG */}
        <svg viewBox="0 0 20 14" className="w-full" style={{ display: 'block' }}>
          {/* Blue background */}
          <rect width="20" height="14" fill="#012169"/>
          {/* White diagonals */}
          <line x1="0" y1="0" x2="20" y2="14" stroke="white" strokeWidth="3"/>
          <line x1="20" y1="0" x2="0" y2="14" stroke="white" strokeWidth="3"/>
          {/* Red diagonals */}
          <line x1="0" y1="0" x2="20" y2="14" stroke="#C8102E" strokeWidth="1.8"/>
          <line x1="20" y1="0" x2="0" y2="14" stroke="#C8102E" strokeWidth="1.8"/>
          {/* White cross */}
          <rect x="8" y="0" width="4" height="14" fill="white"/>
          <rect x="0" y="5" width="20" height="4" fill="white"/>
          {/* Red cross */}
          <rect x="9" y="0" width="2" height="14" fill="#C8102E"/>
          <rect x="0" y="6" width="20" height="2" fill="#C8102E"/>
        </svg>
        <span
          className="font-bold text-white leading-none"
          style={{ fontSize: size === 'sm' ? '5px' : size === 'md' ? '7px' : '9px', letterSpacing: '0.05em' }}
        >
          UK
        </span>
      </span>

      {/* Registration text */}
      <span
        className={cn('text-[#222] font-black leading-none', s.text)}
        style={{ fontFamily: "'Charles Wright', 'Arial Narrow', 'Arial Black', Impact, sans-serif" }}
      >
        {formatReg(registration)}
      </span>
    </span>
  )
}
