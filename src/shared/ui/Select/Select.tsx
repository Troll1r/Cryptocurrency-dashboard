import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, className, style, ...props },
  ref,
) {
  const arrowStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23cbd5e1' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 7 5 6 5-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1rem',
    backgroundPosition: 'right 0.75rem center',
  } as const

  const classes = [
    'min-h-10 appearance-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-10 text-sm text-slate-100 transition-colors hover:border-slate-600 focus:border-sky-400 focus:outline-none',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <select ref={ref} {...props} className={classes} style={{ ...arrowStyle, ...style }}>
      {children}
    </select>
  )
})