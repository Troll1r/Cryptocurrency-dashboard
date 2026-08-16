import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/shared/config'
import type { CurrencyCode } from '@/shared/config'
import type { DisplayCurrency } from '@/entities/currency/model/types'

export interface CurrencyState {
  currency: DisplayCurrency
  setCurrency: (currency: CurrencyCode) => void
}

type PersistedCurrencyState = Pick<CurrencyState, 'currency'>

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<PersistedCurrencyState>(() => window.localStorage)

function isSupportedCurrency(currency: string): currency is CurrencyCode {
  return SUPPORTED_CURRENCIES.some(({ code }) => code === currency)
}

export const useCurrencyStore = create<CurrencyState>()(
  persist<CurrencyState, [], [], PersistedCurrencyState>(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      setCurrency: (currency) => {
        if (isSupportedCurrency(currency)) {
          set({ currency })
        }
      },
    }),
    {
      name: 'crypto-dashboard-currency',
      storage,
      partialize: ({ currency }) => ({ currency }),
      version: 1,
    },
  ),
)
