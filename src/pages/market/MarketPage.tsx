import { useMemo, useState } from 'react'
import { CoinList } from '@/widgets/coin-list'
import { useCoinsQuery } from '@/entities/coin'
import type { Coin } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { MARKET_PAGE_SIZE } from '@/shared/config'
import type { CurrencyCode } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { Card } from '@/shared/ui/Card'
import { QueryErrorState } from '@/shared/ui/QueryErrorState'

function mergeCoins(previous: Coin[], current: Coin[]): Coin[] {
  const nextMap = new Map(previous.map((coin) => [coin.id, coin]))

  current.forEach((coin) => nextMap.set(coin.id, coin))

  return [...nextMap.values()]
}

export function MarketPage() {
  const currency = useCurrencyStore((state) => state.currency)

  return <MarketContent key={currency} currency={currency} />
}

interface MarketContentProps {
  currency: CurrencyCode
}

function MarketContent({ currency }: MarketContentProps) {
  const [page, setPage] = useState(1)
  const [loadedCoins, setLoadedCoins] = useState<Coin[]>([])
  const { t } = useTranslation()

  const { data = [], isLoading, isError, error, refetch } = useCoinsQuery({ currency, page })

  const visibleCoins = useMemo(() => {
    if (page === 1) {
      return data
    }

    return mergeCoins(loadedCoins, data)
  }, [data, loadedCoins, page])

  const hasNextPage = data.length >= MARKET_PAGE_SIZE

  const handleLoadMore = () => {
    setLoadedCoins((previousCoins) => mergeCoins(previousCoins, data))
    setPage((currentPage) => currentPage + 1)
  }

  return (
    <section className="space-y-6 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">{t('market.title')}</h1>
        <p className="max-w-2xl text-slate-400">
          {t('market.description')}
        </p>
      </header>

      {isLoading && page === 1 ? <p className="text-slate-400">{t('market.loading')}</p> : null}

      {isError ? (
        <QueryErrorState
          error={error}
          fallbackMessage={t('market.error')}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && visibleCoins.length === 0 ? (
        <Card className="p-5 text-slate-300">{t('market.noData')}</Card>
      ) : null}

      {!isError && visibleCoins.length > 0 ? (
        <>
          <div className="text-sm text-slate-400">{t('market.showing', { count: visibleCoins.length })}</div>
          <CoinList
            coins={visibleCoins}
            currency={currency}
            hasNextPage={hasNextPage}
            isLoadingMore={isLoading && page > 1}
            onLoadMore={handleLoadMore}
          />
        </>
      ) : null}
    </section>
  )
}
