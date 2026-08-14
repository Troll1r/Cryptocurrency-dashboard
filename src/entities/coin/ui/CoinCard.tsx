import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Coin } from '../model/types'
import { formatCompactNumber, formatPrice } from '@/shared/lib'
import type { CurrencyCode } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { Card } from '@/shared/ui/Card'

export interface CoinCardProps {
  coin: Coin
  currency: CurrencyCode
  action?: ReactNode
}

function getPriceChangeDisplay(change: number | null): { label: string; toneClass: string } {
  if (change === null || !Number.isFinite(change)) {
    return { label: '—', toneClass: 'text-slate-400' }
  }

  const prefix = change > 0 ? '+' : change < 0 ? '−' : ''
  const label = `${prefix}${Math.abs(change).toFixed(2)}%`
  const toneClass =
    change > 0 ? 'text-emerald-400' : change < 0 ? 'text-rose-400' : 'text-slate-400'

  return { label, toneClass }
}

export function CoinCard({ coin, currency, action }: CoinCardProps) {
  const priceChange = getPriceChangeDisplay(coin.priceChangePercentage24h)
  const rankLabel = coin.marketCapRank ?? '—'
  const { locale, t } = useTranslation()

  return (
    <Card className="p-0">
      <div className="flex items-stretch gap-3">
        <Link
          to={`/coin/${coin.id}`}
          className="flex min-w-0 flex-1 items-center gap-4 rounded-xl p-4 transition-colors hover:bg-slate-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <span className="w-8 shrink-0 text-center text-sm font-semibold text-slate-500">{rankLabel}</span>
          <img
            src={coin.image}
            alt={t('coin.logo', { name: coin.name })}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full bg-slate-800 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="truncate font-semibold text-white">{coin.name}</span>
              <span className="text-sm font-medium text-slate-400">{coin.symbol.toUpperCase()}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-white">{formatPrice(coin.currentPrice, currency, locale)}</span>
              <span className={priceChange.toneClass}>
                {priceChange.label}
                <span className="sr-only">{t('coin.priceChange24h')}</span>
              </span>
              <span className="text-slate-400">
                {t('coin.marketCap')} {formatCompactNumber(coin.marketCap, locale)}
              </span>
            </div>
          </div>
        </Link>
        {action ? <div className="flex shrink-0 items-center pr-4">{action}</div> : null}
      </div>
    </Card>
  )
}
