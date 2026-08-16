import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCoinsQuery, useFavoritesStore, useMarketChartQuery } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { AddToFavoritesButton } from '@/features/add-to-favorites'
import { getErrorMessage } from '@/shared/api'
import { CHART_PERIODS } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { formatCompactNumber, formatPrice } from '@/shared/lib'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Loader } from '@/shared/ui/Loader'
import { CurrencyConverter } from '@/widgets/currency-converter'
import { PriceChart } from '@/widgets/price-chart'

export function CoinDetailsPage() {
  const { id } = useParams()
  const currency = useCurrencyStore((state) => state.currency)
  const { locale, t } = useTranslation()
  const [activePeriod, setActivePeriod] = useState<(typeof CHART_PERIODS)[number]['id']>(
    CHART_PERIODS[0].id,
  )

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
      { label: t('details.marketCap'), value: formatCompactNumber(coin.marketCap, locale) },
      { label: t('details.volume24h'), value: formatCompactNumber(coin.totalVolume, locale) },
      { label: t('details.range24h'), value: `${formatPrice(coin.low24h, currency, locale)} — ${formatPrice(coin.high24h, currency, locale)}` },
      { label: t('details.rank'), value: `#${coin.marketCapRank ?? '—'}` },
    ]
  }, [coin, currency, locale, t])

  if (isMarketLoading) {
    return (
      <section className="flex min-h-80 items-center justify-center">
        <Loader label={t('details.loading')} size="lg" />
      </section>
    )
  }

  if (isMarketError || !coin) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">{t('details.notFound')}</h1>
        <p className="text-slate-400">
          {getErrorMessage(marketError, t, t('details.notFoundError'))}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" variant="secondary" onClick={() => refetchMarket()}>
            {t('action.retry')}
          </Button>
          <Link to="/market" className="text-sm font-medium text-sky-400 hover:text-sky-300">
            {t('details.backToMarket')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 py-4">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img src={coin.image} alt={t('coin.logo', { name: coin.name })} width={56} height={56} className="size-14 rounded-full object-cover" />
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-sky-400">{coin.symbol.toUpperCase()}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{coin.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-400">{t('details.currentPrice')}</p>
            <p className="text-3xl font-bold text-white">{formatPrice(coin.currentPrice, currency, locale)}</p>
          </div>
          <AddToFavoritesButton coinId={coin.id} coinName={coin.name} />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">{t('details.change24h')}</p>
                <p className={`mt-2 text-2xl font-bold ${priceChangeTone}`}>
                  {coin.priceChangePercentage24h === null || coin.priceChangePercentage24h === undefined
                    ? '—'
                    : `${coin.priceChangePercentage24h >= 0 ? '+' : ''}${coin.priceChangePercentage24h.toFixed(2)}%`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">{t('details.lastUpdated')}</p>
                <p className="mt-2 text-base font-semibold text-white">{new Date(coin.lastUpdated).toLocaleDateString(locale, { dateStyle: 'medium' })}</p>
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
              <h2 className="text-xl font-semibold text-white">{t('chart.priceHistory')}</h2>
              {favoriteIds.includes(coin.id) ? <span className="text-sm text-sky-300">{t('details.saved')}</span> : null}
            </div>

            {isChartLoading ? (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70">
                <Loader label={t('details.loadingChart')} />
              </div>
            ) : isChartError ? (
              <Card className="space-y-3 p-5">
                <p className="text-sm text-rose-300">
                  {getErrorMessage(chartError, t, t('details.chartError'))}
                </p>
                <Button type="button" variant="secondary" onClick={() => refetchChart()}>
                  {t('action.retryChart')}
                </Button>
              </Card>
            ) : (
              <PriceChart data={chartData} currency={currency} activePeriod={activePeriod} onPeriodChange={setActivePeriod} />
            )}

            {chartData.length === 0 && !isChartLoading && !isChartError ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-400">
                {t('details.emptyChart')}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <CurrencyConverter coin={coin} currency={currency} />
          <Card className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{t('details.overview')}</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center justify-between gap-3">
                <span>{t('details.currentPrice')}</span>
                <span className="font-semibold text-white">{formatPrice(coin.currentPrice, currency, locale)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>{t('details.low24h')}</span>
                <span className="font-semibold text-white">{formatPrice(coin.low24h, currency, locale)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>{t('details.high24h')}</span>
                <span className="font-semibold text-white">{formatPrice(coin.high24h, currency, locale)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>{t('details.volume')}</span>
                <span className="font-semibold text-white">{formatCompactNumber(coin.totalVolume, locale)}</span>
              </li>
            </ul>
            <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => refetchChart()}>
              {t('action.refreshChart')}
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}
