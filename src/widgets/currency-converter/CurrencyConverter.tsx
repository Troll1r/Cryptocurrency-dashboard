import { useMemo, useState } from 'react'
import type { Coin, CoinSearchResult } from '@/entities/coin'
import { useCoinsQuery } from '@/entities/coin'
import type { CurrencyCode } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { formatPrice } from '@/shared/lib'
import { Card } from '@/shared/ui/Card'
import { CoinSelect } from './CoinSelect'

export interface CurrencyConverterProps {
  coin?: Coin
  coins?: Coin[]
  currency: CurrencyCode
}

function formatCoinAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 8,
  }).format(value)
}

function metaToCoin(meta: CoinSearchResult): Coin {
  return {
    id: meta.id,
    symbol: meta.symbol,
    name: meta.name,
    image: meta.large,
    currentPrice: null,
    marketCap: null,
    marketCapRank: meta.marketCapRank,
    totalVolume: null,
    high24h: null,
    low24h: null,
    priceChange24h: null,
    priceChangePercentage24h: null,
    lastUpdated: '',
  }
}

export function CurrencyConverter({ coin, coins = [], currency }: CurrencyConverterProps) {
  const [amount, setAmount] = useState('1')
  const [selectedSourceCoinId, setSelectedSourceCoinId] = useState(coin?.id ?? '')
  const [selectedTargetCoinId, setSelectedTargetCoinId] = useState('')
  const [extraCoinMeta, setExtraCoinMeta] = useState<Record<string, CoinSearchResult>>({})
  const { locale, t } = useTranslation()

  const loadedCoinIds = useMemo(() => new Set(coins.map((loadedCoin) => loadedCoin.id)), [coins])
  const extraCoinIds = useMemo(
    () => Object.keys(extraCoinMeta).filter((id) => !loadedCoinIds.has(id)),
    [extraCoinMeta, loadedCoinIds],
  )
  const { data: fetchedExtraCoins = [] } = useCoinsQuery({ currency, ids: extraCoinIds })

  const knownCoins = useMemo(() => {
    const map = new Map(coins.map((loadedCoin) => [loadedCoin.id, loadedCoin]))

    extraCoinIds.forEach((id) => {
      const meta = extraCoinMeta[id]

      if (meta && !map.has(id)) {
        map.set(id, metaToCoin(meta))
      }
    })

    fetchedExtraCoins.forEach((extraCoin) => map.set(extraCoin.id, extraCoin))

    return [...map.values()]
  }, [coins, extraCoinIds, extraCoinMeta, fetchedExtraCoins])

  const sourceCoinId =
    coin?.id ??
    (knownCoins.some(({ id }) => id === selectedSourceCoinId)
      ? selectedSourceCoinId
      : knownCoins[0]?.id ?? '')
  const targetCoinId =
    coin
      ? ''
      : knownCoins.some(({ id }) => id === selectedTargetCoinId && id !== sourceCoinId)
        ? selectedTargetCoinId
        : knownCoins.find(({ id }) => id !== sourceCoinId)?.id ?? ''

  const selectedSourceCoin = coin ?? knownCoins.find((candidate) => candidate.id === sourceCoinId)
  const selectedTargetCoin = coin ? undefined : knownCoins.find((candidate) => candidate.id === targetCoinId)

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(/,/g, '.')

    if (!normalized || normalized === '.') {
      return NaN
    }

    return Number(normalized)
  }, [amount])

  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0
  const sourceCoinPrice = selectedSourceCoin?.currentPrice ?? 0
  const targetCoinPrice = selectedTargetCoin?.currentPrice ?? 0
  const isPriceLoading =
    (extraCoinIds.includes(sourceCoinId) && selectedSourceCoin?.currentPrice == null) ||
    (!coin && extraCoinIds.includes(targetCoinId) && selectedTargetCoin?.currentPrice == null)
  const convertedCurrencyValue = isValidAmount && selectedSourceCoin ? parsedAmount * sourceCoinPrice : 0
  const convertedCoinValue =
    isValidAmount && selectedSourceCoin && selectedTargetCoin && targetCoinPrice > 0
      ? convertedCurrencyValue / targetCoinPrice
      : 0

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value

    if (nextValue === '' || /^\d*[.,]?\d*$/.test(nextValue)) {
      setAmount(nextValue)
    }
  }

  function handleSourceChange(coinId: string, meta: CoinSearchResult | undefined) {
    setSelectedSourceCoinId(coinId)

    if (meta) {
      setExtraCoinMeta((previous) => ({ ...previous, [coinId]: meta }))
    }
  }

  function handleTargetChange(coinId: string, meta: CoinSearchResult | undefined) {
    setSelectedTargetCoinId(coinId)

    if (meta) {
      setExtraCoinMeta((previous) => ({ ...previous, [coinId]: meta }))
    }
  }

  const showCoinSelect = !coin && coins.length > 0
  const canConvertToCoin =
    isValidAmount &&
    selectedSourceCoin &&
    selectedTargetCoin &&
    Number.isFinite(sourceCoinPrice) &&
    Number.isFinite(targetCoinPrice) &&
    sourceCoinPrice > 0 &&
    targetCoinPrice > 0

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold text-white">
        {selectedSourceCoin ? t('converter.convert', { name: selectedSourceCoin.name }) : t('converter.title')}
      </h2>

      <div className="mt-4 space-y-4">
        {showCoinSelect ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <CoinSelect
              label={t('converter.fromCoin')}
              ariaLabel={t('converter.selectSource')}
              value={sourceCoinId}
              onChange={handleSourceChange}
              coins={knownCoins}
            />
            <CoinSelect
              label={t('converter.toCoin')}
              ariaLabel={t('converter.selectTarget')}
              value={targetCoinId}
              onChange={handleTargetChange}
              coins={knownCoins}
              excludeCoinId={sourceCoinId}
            />
          </div>
        ) : null}

        <label className="block text-sm text-slate-300">
          <span className="mb-2 block">{t('converter.amount')}</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            placeholder={t('converter.enterAmount')}
            aria-label={t('converter.amount')}
          />
        </label>

        {selectedSourceCoin ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">{t('converter.convertedTotal')}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {coin
                ? isValidAmount
                  ? formatPrice(convertedCurrencyValue, currency, locale)
                  : t('converter.enterValidAmount')
                : isPriceLoading
                  ? t('converter.loadingPrice')
                  : canConvertToCoin
                    ? `${formatCoinAmount(convertedCoinValue, locale)} ${selectedTargetCoin.symbol.toUpperCase()}`
                    : isValidAmount
                      ? t('converter.selectValidTarget')
                      : t('converter.enterValidAmount')}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {t('converter.price', {
                symbol: selectedSourceCoin.symbol.toUpperCase(),
                price: formatPrice(selectedSourceCoin.currentPrice, currency, locale),
              })}
            </p>
            {!coin && canConvertToCoin ? (
              <p className="mt-1 text-sm text-slate-400">≈ {formatPrice(convertedCurrencyValue, currency, locale)}</p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center text-slate-400">
            {t('converter.noCoinSelected')}
          </div>
        )}
      </div>
    </Card>
  )
}
