import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LogbookLogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { icon: 'h-6 w-6',  text: 'text-lg' },
  md: { icon: 'h-8 w-8',  text: 'text-[1.25rem]' },
  lg: { icon: 'h-10 w-10', text: 'text-2xl' },
}

/**
 * The Logbook logotype: L-plate icon + "ogbook" in brand orange.
 * The icon serves as the letter "L" — together they read "Logbook".
 */
export function LogbookLogo({ href, size = 'md', className }: LogbookLogoProps) {
  const s = sizes[size]

  const inner = (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src="/l-plate.svg"
        alt="Logbook"
        className={cn(s.icon, 'select-none shrink-0')}
        aria-hidden="true"
      />
      <span
        className={cn('font-black tracking-tight text-brand-600 select-none leading-none', s.text)}
        aria-hidden="true"
      >
        ogbook
      </span>
    </span>
  )

  if (href) {
    return (
      <Link href={href} aria-label="Logbook home">
        {inner}
      </Link>
    )
  }

  return inner
}
