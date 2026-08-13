export interface LoaderProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClassNames = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
} as const

export function Loader({ label = 'Loading', size = 'md' }: LoaderProps) {
  return (
    <div role="status" aria-label={label} className="inline-flex items-center justify-center">
      <span aria-hidden="true" className={`${sizeClassNames[size]} animate-spin rounded-full border-sky-400 border-r-transparent`} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
