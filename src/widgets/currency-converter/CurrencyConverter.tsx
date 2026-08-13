import { useMemo, useState } from 'react'
import type { Coin } from '@/entities/coin/model/types'
import type { CurrencyCode } from '@/shared/config'
import { formatPrice } from '@/shared/lib'
import { Card } from '@/shared/ui/Card'

export interface CurrencyConverterProps {
  coin?: Coin
  coins?: Coin[]
  currency: CurrencyCode
}

export function CurrencyConverter({ coin, coins = [], currency }: CurrencyConverterProps) {
  const [amount, setAmount] = useState('1')
  const [selectedCoinId, setSelectedCoinId] = useState(coin?.id ?? coins[0]?.id ?? '')

  const selectedCoin = coin ?? coins.find((c) => c.id === selectedCoinId)

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(/,/g, '.')

    if (!normalized || normalized === '.') {
      return NaN
    }

    return Number(normalized)
  }, [amount])

  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0
  const convertedValue = isValidAmount && selectedCoin ? parsedAmount * (selectedCoin.currentPrice ?? 0) : 0

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value

    if (nextValue === '' || /^\d*[.,]?\d*$/.test(nextValue)) {
      setAmount(nextValue)
    }
  }

  const showCoinSelect = !coin && coins.length > 0

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold text-white">
        {selectedCoin ? `Convert ${selectedCoin.name}` : 'Currency Converter'}
      </h2>

      <div className="mt-4 space-y-4">
        {showCoinSelect ? (
          <label className="block text-sm text-slate-300">
            <span className="mb-2 block">Select coin</span>
            <select
              value={selectedCoinId}
              onChange={(event) => setSelectedCoinId(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
              aria-label="Select cryptocurrency"
            >
              {coins.length === 0 ? (
                <option value="" disabled>
                  No coins available
                </option>
              ) : (
                coins.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol.toUpperCase()})
                  </option>
                ))
              )}
            </select>
          </label>
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
            aria-label={selectedCoin ? `Amount of ${selectedCoin.name}` : 'Amount'}
          />
        </label>

        {selectedCoin ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Converted total</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {isValidAmount ? formatPrice(convertedValue, currency) : 'Enter a valid positive amount'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {selectedCoin.symbol.toUpperCase()} price: {formatPrice(selectedCoin.currentPrice, currency)}
            </p>
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
