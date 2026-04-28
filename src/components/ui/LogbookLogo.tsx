import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LogbookLogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const heights = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-12',
}

/**
 * The official Logbook logo PNG (L-plate icon + Logbook wordmark).
 * Use size="sm" in footers/legal, size="md" in nav/sidebar, size="lg" in auth screens.
 */
export function LogbookLogo({ href, size = 'md', className }: LogbookLogoProps) {
  const inner = (
    <img
      src="/logbook-logo.png"
      alt="Logbook"
      className={cn('w-auto select-none', heights[size], className)}
    />
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
