import type { ChartPeriod } from '@/entities/coin'

export function formatXAxisTick(value: number, period: ChartPeriod): string {
  const date = new Date(value)

  if (period === '24h') {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}
