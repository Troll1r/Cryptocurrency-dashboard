import { useMemo } from 'react'
import { useCoinsQuery, useFavoritesStore } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { CoinList } from '@/widgets/coin-list'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { QueryErrorState } from '@/shared/ui/QueryErrorState'
import { useTranslation } from '@/shared/i18n'

export function FavoritesPage() {
  const currency = useCurrencyStore((state) => state.currency)
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds)
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const { t } = useTranslation()
  const { data = [], isLoading, isError, error, refetch } = useCoinsQuery({
    currency,
    ids: favoriteIds,
  })

  const favoriteCount = favoriteIds.length
  const unavailableFavoriteIds = favoriteIds.filter(
    (favoriteId) => !data.some((coin) => coin.id === favoriteId),
  )
  const orderedCoins = useMemo(
    () =>
      favoriteIds
        .map((favoriteId) => data.find((coin) => coin.id === favoriteId))
        .filter((coin): coin is NonNullable<typeof coin> => Boolean(coin)),
    [data, favoriteIds],
  )

  return (
    <section className="space-y-6 py-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t('favorites.title')}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            {t('favorites.description')}
          </p>
        </div>
        {favoriteCount > 0 ? (
          <Button type="button" variant="secondary" onClick={clearFavorites}>
            {t('action.clearAll')}
          </Button>
        ) : null}
      </header>

      {isLoading ? <p className="text-slate-400">{t('favorites.loading')}</p> : null}

      {isError ? (
        <QueryErrorState
          error={error}
          fallbackMessage={t('favorites.error')}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && favoriteCount === 0 ? (
        <Card className="p-6 text-center text-slate-300">
          <p className="text-lg font-medium text-white">{t('favorites.emptyTitle')}</p>
          <p className="mt-2 text-sm text-slate-400">{t('favorites.emptyDescription')}</p>
        </Card>
      ) : null}

      {!isLoading && !isError && unavailableFavoriteIds.length > 0 ? (
        <Card className="space-y-3 p-5">
          <p className="text-slate-300">{t('favorites.unavailable')}</p>
          <ul className="space-y-2">
            {unavailableFavoriteIds.map((favoriteId) => (
              <li key={favoriteId} className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                <span>{favoriteId}</span>
                <Button type="button" variant="secondary" onClick={() => toggleFavorite(favoriteId)}>
                  {t('action.remove')}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {!isLoading && !isError && orderedCoins.length > 0 ? (
        <CoinList coins={orderedCoins} currency={currency} />
      ) : null}
    </section>
  )
}
