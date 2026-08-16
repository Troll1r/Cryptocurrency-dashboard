import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ children, className, ...props }: CardProps) {
  const classes = [
    'rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/10',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...props} className={classes}>
      {children}
    </div>
  )
}
