import { useId } from 'react'
import { useCurrencyStore } from '@/entities/currency'
import { SUPPORTED_CURRENCIES } from '@/shared/config'
import type { CurrencyCode } from '@/shared/config'

export function CurrencySwitcher() {
  const id = useId()
  const currency = useCurrencyStore((state) => state.currency)
  const setCurrency = useCurrencyStore((state) => state.setCurrency)

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        Display currency
      </label>
      <select
        id={id}
        value={currency}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        className="min-h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-600"
      >
        {SUPPORTED_CURRENCIES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
