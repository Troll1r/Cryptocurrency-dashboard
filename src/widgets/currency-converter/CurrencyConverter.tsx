import { useEffect, useMemo, useState } from 'react'
import type { Coin } from '@/entities/coin/model/types'
import type { CurrencyCode } from '@/shared/config'
import { formatPrice } from '@/shared/lib'
import { Card } from '@/shared/ui/Card'
import { Select } from '@/shared/ui/Select'

export interface CurrencyConverterProps {
  coin?: Coin
  coins?: Coin[]
  currency: CurrencyCode
}

function formatCoinAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8,
  }).format(value)
}

export function CurrencyConverter({ coin, coins = [], currency }: CurrencyConverterProps) {
  const [amount, setAmount] = useState('1')
  const [selectedSourceCoinId, setSelectedSourceCoinId] = useState(coin?.id ?? coins[0]?.id ?? '')
  const [selectedTargetCoinId, setSelectedTargetCoinId] = useState(() => {
    const firstCoinId = coins[0]?.id

    if (!firstCoinId) {
      return ''
    }

    return coins.find(({ id }) => id !== firstCoinId)?.id ?? ''
  })

  const selectedSourceCoin = coin ?? coins.find((c) => c.id === selectedSourceCoinId)
  const selectedTargetCoin = coin ? undefined : coins.find((c) => c.id === selectedTargetCoinId)

  useEffect(() => {
    if (coin || coins.length < 2) {
      return
    }

    if (!selectedTargetCoinId || selectedTargetCoinId === selectedSourceCoinId) {
      const fallbackTargetCoinId = coins.find(({ id }) => id !== selectedSourceCoinId)?.id ?? ''
      setSelectedTargetCoinId(fallbackTargetCoinId)
    }
  }, [coin, coins, selectedSourceCoinId, selectedTargetCoinId])

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
        {selectedSourceCoin ? `Convert ${selectedSourceCoin.name}` : 'Currency Converter'}
      </h2>

      <div className="mt-4 space-y-4">
        {showCoinSelect ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">From coin</span>
              <Select
                value={selectedSourceCoinId}
                onChange={(event) => setSelectedSourceCoinId(event.target.value)}
                className="w-full bg-slate-950 text-white"
                aria-label="Select source cryptocurrency"
              >
                {coins.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol.toUpperCase()})
                  </option>
                ))}
              </Select>
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">To coin</span>
              <Select
                value={selectedTargetCoinId}
                onChange={(event) => setSelectedTargetCoinId(event.target.value)}
                className="w-full bg-slate-950 text-white"
                aria-label="Select target cryptocurrency"
              >
                {coins.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol.toUpperCase()})
                  </option>
                ))}
              </Select>
            </label>
          </div>
        ) : null}

        <label className="block text-sm text-slate-300">
          <span className="mb-2 block">Amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            placeholder="Enter amount"
            aria-label={selectedSourceCoin ? `Amount of ${selectedSourceCoin.name}` : 'Amount'}
          />
        </label>

        {selectedSourceCoin ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Converted total</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {coin
                ? isValidAmount
                  ? formatPrice(convertedCurrencyValue, currency)
                  : 'Enter a valid positive amount'
                : canConvertToCoin
                  ? `${formatCoinAmount(convertedCoinValue)} ${selectedTargetCoin.symbol.toUpperCase()}`
                  : isValidAmount
                    ? 'Select a valid target coin'
                    : 'Enter a valid positive amount'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {selectedSourceCoin.symbol.toUpperCase()} price: {formatPrice(selectedSourceCoin.currentPrice, currency)}
            </p>
            {!coin && canConvertToCoin ? (
              <p className="mt-1 text-sm text-slate-400">≈ {formatPrice(convertedCurrencyValue, currency)}</p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center text-slate-400">
            No coin selected
          </div>
        )}
      </div>
    </Card>
  )
}
