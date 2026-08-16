import { useMemo, useState } from 'react'
import { useCoinSearchQuery } from '@/entities/coin'
import type { Coin, CoinSearchResult } from '@/entities/coin'
import { COIN_SEARCH_MIN_QUERY_LENGTH } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { SearchableSelect } from '@/shared/ui/SearchableSelect'
import type { SearchableSelectOption } from '@/shared/ui/SearchableSelect'

export interface CoinSelectProps {
  label: string
  ariaLabel: string
  value: string | undefined
  onChange: (coinId: string, meta: CoinSearchResult | undefined) => void
  coins: readonly Coin[]
  excludeCoinId?: string
}

function matchesQuery(coin: { name: string; symbol: string }, query: string): boolean {
  return coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)
}

export function CoinSelect({ label, ariaLabel, value, onChange, coins, excludeCoinId }: CoinSelectProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const { data: searchResults = [], isFetching } = useCoinSearchQuery(query)
  const normalizedQuery = query.trim().toLowerCase()

  const options = useMemo<SearchableSelectOption[]>(() => {
    const seen = new Set<string>()
    const result: SearchableSelectOption[] = []

    function push(id: string, name: string, symbol: string) {
      if (id === excludeCoinId || seen.has(id)) {
        return
      }

      seen.add(id)
      result.push({ value: id, label: `${name} (${symbol.toUpperCase()})` })
    }

    // Known coins (with prices), filtered locally by the query.
    coins.forEach((coin) => {
      if (!normalizedQuery || matchesQuery(coin, normalizedQuery)) {
        push(coin.id, coin.name, coin.symbol)
      }
    })

    // Server-side search results across all coins, including ones beyond the loaded list.
    if (normalizedQuery.length >= COIN_SEARCH_MIN_QUERY_LENGTH) {
      searchResults.forEach((coin) => {
        if (matchesQuery(coin, normalizedQuery)) {
          push(coin.id, coin.name, coin.symbol)
        }
      })
    }

    return result
  }, [coins, searchResults, normalizedQuery, excludeCoinId])

  function handleChange(coinId: string) {
    const isKnownCoin = coins.some((coin) => coin.id === coinId)
    const meta = isKnownCoin ? undefined : searchResults.find((coin) => coin.id === coinId)

    onChange(coinId, meta)
  }

  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-2 block">{label}</span>
      <SearchableSelect
        value={value}
        options={options}
        onChange={handleChange}
        onQueryChange={setQuery}
        placeholder={t('converter.searchPlaceholder')}
        ariaLabel={ariaLabel}
        isLoading={isFetching}
      />
    </label>
  )
}
