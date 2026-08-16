import { Link } from 'react-router-dom'
import { CoinCard, useCoinsQuery } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { AddToFavoritesButton } from '@/features/add-to-favorites'
import { useTranslation } from '@/shared/i18n'
import { formatCompactNumber, formatPrice } from '@/shared/lib'
import { Card } from '@/shared/ui/Card'
import { QueryErrorState } from '@/shared/ui/QueryErrorState'

export function HomePage() {
  const currency = useCurrencyStore((state) => state.currency)
  const { data = [], isLoading, isError, error, refetch } = useCoinsQuery({ currency })
  const { locale, t } = useTranslation()

  const totalMarketCap = data.reduce((total, coin) => total + (coin.marketCap ?? 0), 0)
  const totalVolume = data.reduce((total, coin) => total + (coin.totalVolume ?? 0), 0)

  return (
    <section className="space-y-8 py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">Crypto Dashboard</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {t('home.title')}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          {t('home.description')}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/market"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-300"
        >
          {t('home.exploreMarket')}
        </Link>
        <Link
          to="/converter"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-100 transition-colors hover:border-slate-600 hover:bg-slate-900"
        >
          {t('home.openConverter')}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{t('home.loadedMarketCap')}</p>
          <p className="mt-3 text-2xl font-bold text-white">{formatPrice(totalMarketCap, currency, locale)}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{t('home.volume24h')}</p>
          <p className="mt-3 text-2xl font-bold text-white">{formatPrice(totalVolume, currency, locale)}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{t('home.coinsTracked')}</p>
          <p className="mt-3 text-2xl font-bold text-white">{formatCompactNumber(data.length, locale)}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">{t('home.topAssets')}</h2>
          <Link to="/market" className="text-sm font-medium text-sky-400 hover:text-sky-300">
            {t('home.viewAll')}
          </Link>
        </div>

        {isLoading ? <p className="text-slate-400">{t('home.loadingMarket')}</p> : null}

        {isError ? (
          <QueryErrorState
            error={error}
            fallbackMessage={t('home.marketError')}
            onRetry={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError && data.length === 0 ? (
          <Card className="p-5 text-slate-300">{t('home.noData')}</Card>
        ) : null}

        {!isLoading && !isError && data.length > 0 ? (
          <div className="space-y-3">
            {data.slice(0, 5).map((coin) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                currency={currency}
                action={<AddToFavoritesButton coinId={coin.id} coinName={coin.name} />}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
