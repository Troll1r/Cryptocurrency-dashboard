import { useMemo, useState } from 'react'
import type { Coin } from '@/entities/coin/model/types'
import type { CurrencyCode } from '@/shared/config'
import { formatPrice } from '@/shared/lib'
import { Card } from '@/shared/ui/Card'

export interface CurrencyConverterProps {
  coin: Coin
  currency: CurrencyCode
}

export function CurrencyConverter({ coin, currency }: CurrencyConverterProps) {
  const [amount, setAmount] = useState('1')

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(/,/g, '.')

    if (!normalized || normalized === '.') {
      return NaN
    }

    return Number(normalized)
  }, [amount])

  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0
  const convertedValue = isValidAmount ? parsedAmount * (coin.currentPrice ?? 0) : 0

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value

    if (nextValue === '' || /^\d*\.?\d*$/.test(nextValue)) {
      setAmount(nextValue)
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold text-white">Convert {coin.name}</h2>

      <div className="mt-4 space-y-4">
        <label className="block text-sm text-slate-300">
          <span className="mb-2 block">Amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            placeholder="Enter amount"
            aria-label={`Amount of ${coin.name}`}
          />
        </label>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Converted total</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {isValidAmount ? formatPrice(convertedValue, currency) : 'Enter a valid positive amount'}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {coin.symbol.toUpperCase()} price: {formatPrice(coin.currentPrice, currency)}
          </p>
        </div>
      </div>
    </Card>
  )
}
