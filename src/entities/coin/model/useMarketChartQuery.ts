import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api'
import { getMarketChart } from '@/entities/coin/api/coinApi'
import type { ChartPoint, ChartPeriod, CurrencyCode } from '@/entities/coin/model/types'

export interface UseMarketChartQueryOptions {
  id: string | undefined
  currency: CurrencyCode
  period: ChartPeriod
}

export function useMarketChartQuery({ id, currency, period }: UseMarketChartQueryOptions) {
  const normalizedId = id?.trim() ?? ''

  return useQuery<ChartPoint[], ApiError>({
    queryKey: ['coins', 'market-chart', normalizedId, currency, period],
    queryFn: () => getMarketChart({ id: normalizedId, currency, period }),
    enabled: Boolean(normalizedId),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
