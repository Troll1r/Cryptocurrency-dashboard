import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api'
import { COIN_SEARCH_DEBOUNCE_MS, COIN_SEARCH_MIN_QUERY_LENGTH } from '@/shared/config'
import { useDebouncedValue } from '@/shared/lib'
import { searchCoins } from '@/entities/coin/api/coinApi'
import type { CoinSearchResult } from '@/entities/coin/model/types'

export function useCoinSearchQuery(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), COIN_SEARCH_DEBOUNCE_MS)
  const normalizedQuery = debouncedQuery.toLowerCase()

  return useQuery<CoinSearchResult[], ApiError>({
    queryKey: ['coins', 'search', normalizedQuery],
    queryFn: () => searchCoins(normalizedQuery),
    enabled: normalizedQuery.length >= COIN_SEARCH_MIN_QUERY_LENGTH,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })
}
