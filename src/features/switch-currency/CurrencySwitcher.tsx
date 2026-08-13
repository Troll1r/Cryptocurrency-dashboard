import { useId } from 'react'
import { useCurrencyStore } from '@/entities/currency'
import { SUPPORTED_CURRENCIES } from '@/shared/config'
import type { CurrencyCode } from '@/shared/config'
import { Select } from '@/shared/ui'

export function CurrencySwitcher() {
  const id = useId()
  const currency = useCurrencyStore((state) => state.currency)
  const setCurrency = useCurrencyStore((state) => state.setCurrency)

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        Display currency
      </label>
      <Select
        id={id}
        value={currency}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        className="min-w-28 font-semibold"
      >
        {SUPPORTED_CURRENCIES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  )
}
