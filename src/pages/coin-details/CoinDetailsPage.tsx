import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCoinsQuery, useFavoritesStore, useMarketChartQuery } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { AddToFavoritesButton } from '@/features/add-to-favorites'
import { CHART_PERIODS } from '@/shared/config'
import { formatCompactNumber, formatPrice } from '@/shared/lib'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Loader } from '@/shared/ui/Loader'
import { CurrencyConverter } from '@/widgets/currency-converter'
import { PriceChart } from '@/widgets/price-chart'

export function CoinDetailsPage() {
  const { id } = useParams()
  const currency = useCurrencyStore((state) => state.currency)
  const [activePeriod, setActivePeriod] = useState<(typeof CHART_PERIODS)[number]['id']>('24h')

  const { data: marketData = [], isLoading: isMarketLoading, isError: isMarketError, error: marketError, refetch: refetchMarket } = useCoinsQuery({
    currency,
    ids: id ? [id] : [],
  })

  const coin = marketData[0]

  const {
    data: chartData = [],
    isLoading: isChartLoading,
    isError: isChartError,
    error: chartError,
    refetch: refetchChart,
  } = useMarketChartQuery({
    id,
    currency,
    period: activePeriod,
  })

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds)
  const priceChangeTone =
    coin?.priceChangePercentage24h === null || coin?.priceChangePercentage24h === undefined
      ? 'text-slate-400'
      : coin.priceChangePercentage24h > 0
        ? 'text-emerald-400'
        : coin.priceChangePercentage24h < 0
          ? 'text-rose-400'
          : 'text-slate-400'

  const marketStats = useMemo(() => {
    if (!coin) {
      return []
    }

    return [
      { label: 'Market cap', value: formatCompactNumber(coin.marketCap) },
      { label: 'Volume 24h', value: formatCompactNumber(coin.totalVolume) },
      { label: '24h range', value: `${formatPrice(coin.low24h, currency)} — ${formatPrice(coin.high24h, currency)}` },
      { label: 'Rank', value: `#${coin.marketCapRank ?? '—'}` },
    ]
  }, [coin, currency])

  if (isMarketLoading) {
    return (
      <section className="flex min-h-80 items-center justify-center">
        <Loader label="Loading coin details" size="lg" />
      </section>
    )
  }

  if (isMarketError || !coin) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Coin not found</h1>
        <p className="text-slate-400">
          {marketError instanceof Error ? marketError.message : 'Unable to load this coin right now.'}
        </p>
        <Button type="button" variant="secondary" onClick={() => refetchMarket()}>
          Retry
        </Button>
        <Link to="/market" className="text-sm font-medium text-sky-400 hover:text-sky-300">
          Back to market
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6 py-4">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img src={coin.image} alt={`${coin.name} logo`} width={56} height={56} className="size-14 rounded-full object-cover" />
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-sky-400">{coin.symbol.toUpperCase()}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{coin.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-400">Current price</p>
            <p className="text-3xl font-bold text-white">{formatPrice(coin.currentPrice, currency)}</p>
          </div>
          <AddToFavoritesButton coinId={coin.id} coinName={coin.name} />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">24h change</p>
                <p className={`mt-2 text-2xl font-bold ${priceChangeTone}`}>
                  {coin.priceChangePercentage24h === null || coin.priceChangePercentage24h === undefined
                    ? '—'
                    : `${coin.priceChangePercentage24h >= 0 ? '+' : ''}${coin.priceChangePercentage24h.toFixed(2)}%`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Last updated</p>
                <p className="mt-2 text-base font-semibold text-white">{new Date(coin.lastUpdated).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {marketStats.map(({ label, value }) => (
              <Card key={label} className="p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{value}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Price history</h2>
              {favoriteIds.includes(coin.id) ? <span className="text-sm text-sky-300">Saved in favorites</span> : null}
            </div>

            {isChartLoading ? (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70">
                <Loader label="Loading chart" />
              </div>
            ) : isChartError ? (
              <Card className="space-y-3 p-5">
                <p className="text-sm text-rose-300">
                  {chartError instanceof Error ? chartError.message : 'Unable to load chart data.'}
                </p>
                <Button type="button" variant="secondary" onClick={() => refetchChart()}>
                  Retry chart
                </Button>
              </Card>
            ) : (
              <PriceChart data={chartData} currency={currency} activePeriod={activePeriod} onPeriodChange={setActivePeriod} />
            )}

            {chartData.length === 0 && !isChartLoading && !isChartError ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-400">
                No chart data is available for this period.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <CurrencyConverter coin={coin} currency={currency} />
          <Card className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Overview</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center justify-between gap-3">
                <span>Current price</span>
                <span className="font-semibold text-white">{formatPrice(coin.currentPrice, currency)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>24h low</span>
                <span className="font-semibold text-white">{formatPrice(coin.low24h, currency)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>24h high</span>
                <span className="font-semibold text-white">{formatPrice(coin.high24h, currency)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Volume</span>
                <span className="font-semibold text-white">{formatCompactNumber(coin.totalVolume)}</span>
              </li>
            </ul>
            <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => refetchChart()}>
              Refresh chart
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}
