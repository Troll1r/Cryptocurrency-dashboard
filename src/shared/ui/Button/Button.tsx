import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

const variantClassNames = {
  primary: 'bg-sky-400 text-slate-950 hover:bg-sky-300',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
  ghost: 'bg-transparent text-slate-200 hover:bg-slate-800',
} as const

export type ButtonVariant = keyof typeof variantClassNames

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, disabled, isLoading = false, type, variant = 'primary', ...props },
  ref,
) {
  const classes = [
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none disabled:opacity-50',
    variantClassNames[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      ref={ref}
      type={type ?? 'button'}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
      {children}
    </button>
  )
})
