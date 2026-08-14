import { useMemo, useState } from 'react'
import { CoinCard } from '@/entities/coin'
import type { Coin } from '@/entities/coin'
import { AddToFavoritesButton } from '@/features/add-to-favorites'
import type { CurrencyCode } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Select } from '@/shared/ui/Select'

export interface CoinListProps {
  coins: Coin[]
  currency: CurrencyCode
  hasNextPage?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

type SortKey = 'market_cap' | 'price' | 'change'

function sortCoins(coins: Coin[], sortKey: SortKey): Coin[] {
  return [...coins].sort((left, right) => {
    if (sortKey === 'price') {
      return (right.currentPrice ?? 0) - (left.currentPrice ?? 0)
    }

    if (sortKey === 'change') {
      return (right.priceChangePercentage24h ?? 0) - (left.priceChangePercentage24h ?? 0)
    }

    return (right.marketCap ?? 0) - (left.marketCap ?? 0)
  })
}

export function CoinList({
  coins,
  currency,
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
}: CoinListProps) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('market_cap')
  const { t } = useTranslation()
  const sortOptions: Array<{ value: SortKey; label: string }> = [
    { value: 'market_cap', label: t('list.sortMarketCap') },
    { value: 'price', label: t('list.sortPrice') },
    { value: 'change', label: t('list.sortChange') },
  ]

  const visibleCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filteredCoins = normalizedQuery
      ? coins.filter(
          ({ name, symbol }) =>
            name.toLowerCase().includes(normalizedQuery) || symbol.toLowerCase().includes(normalizedQuery),
        )
      : coins

    return sortCoins(filteredCoins, sortBy)
  }, [coins, query, sortBy])

  const showLoadMoreButton = Boolean(onLoadMore)
  const isLoadMoreDisabled = !hasNextPage || isLoadingMore
  const loadMoreLabel = isLoadingMore ? t('action.loadingMore') : t('action.showMore')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block flex-1">
          <span className="sr-only">{t('list.search')}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t('list.search')}
            placeholder={t('list.search')}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <span>{t('list.sortBy')}</span>
          <Select
            aria-label={t('list.sortBy')}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            className="text-white"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {visibleCoins.length === 0 ? (
        <Card className="p-6 text-center text-slate-300">
          <p>{t('list.noMatch')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleCoins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              currency={currency}
              action={<AddToFavoritesButton coinId={coin.id} coinName={coin.name} />}
            />
          ))}
        </div>
      )}

      {showLoadMoreButton ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onLoadMore}
            disabled={isLoadMoreDisabled}
            isLoading={isLoadingMore}
            aria-label={loadMoreLabel}
          >
            {loadMoreLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
