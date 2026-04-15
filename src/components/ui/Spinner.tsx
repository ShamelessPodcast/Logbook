import { cn } from '@/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-black',
        className
      )}
      aria-label="Loading"
    />
  )
}
