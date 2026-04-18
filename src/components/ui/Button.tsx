import { cn } from '@/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:     'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
        secondary:   'border border-[--border-strong] bg-white text-[--ink] hover:bg-[--surface-raised]',
        ghost:       'bg-transparent text-[--ink-subtle] hover:bg-[--surface-raised] hover:text-[--ink]',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline:     'border border-[--border-strong] bg-transparent text-[--ink] hover:bg-[--surface-raised]',
        brand:       'border border-brand-600 text-brand-600 bg-transparent hover:bg-brand-50',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
