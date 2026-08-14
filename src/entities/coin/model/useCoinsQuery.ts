import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api'
import { POLLING_INTERVAL_MS } from '@/shared/config'
import { getCoinsMarkets } from '@/entities/coin/api/coinApi'
import type { Coin, CoinsMarketsRequest } from '@/entities/coin/model/types'

export type UseCoinsQueryOptions = CoinsMarketsRequest

function normalizeIds(ids: readonly string[] | undefined): string[] | undefined {
  if (!ids) {
    return undefined
  }

  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))].sort()
}

export function useCoinsQuery({ currency, page = 1, ids }: UseCoinsQueryOptions) {
  const normalizedIds = normalizeIds(ids)
  const hasRequestedIds = normalizedIds !== undefined

  return useQuery<Coin[], ApiError>({
    queryKey: ['coins', 'markets', currency, page, normalizedIds ?? null],
    queryFn: () => getCoinsMarkets({ currency, page, ids: normalizedIds }),
    enabled: !hasRequestedIds || normalizedIds.length > 0,
    staleTime: POLLING_INTERVAL_MS / 2,
    gcTime: POLLING_INTERVAL_MS * 5,
    refetchInterval: hasRequestedIds ? false : POLLING_INTERVAL_MS,
    refetchIntervalInBackground: false,
  })
}
