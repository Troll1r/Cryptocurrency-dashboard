import { useMemo, useState } from 'react'
import { CoinList } from '@/widgets/coin-list'
import { useCoinsQuery } from '@/entities/coin'
import type { Coin } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { MARKET_PAGE_SIZE } from '@/shared/config'
import type { CurrencyCode } from '@/shared/config'
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Market</h1>
        <p className="max-w-2xl text-slate-400">
          Explore live cryptocurrency prices, search by asset name and sort the market by your preferred metric.
        </p>
      </header>

      {isLoading && page === 1 ? <p className="text-slate-400">Loading market data…</p> : null}

      {isError ? (
        <QueryErrorState
          error={error}
          fallbackMessage="Unable to load market data."
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && visibleCoins.length === 0 ? (
        <Card className="p-5 text-slate-300">No market data available right now.</Card>
      ) : null}

      {!isError && visibleCoins.length > 0 ? (
        <>
          <div className="text-sm text-slate-400">Showing {visibleCoins.length} coins</div>
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
