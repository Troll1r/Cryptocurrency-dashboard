import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CURRENCY } from '@/shared/config'
import { useCurrencyStore } from './useCurrencyStore'

describe('useCurrencyStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useCurrencyStore.setState({ currency: DEFAULT_CURRENCY })
    useCurrencyStore.persist.clearStorage()
  })

  it('changes the display currency', () => {
    useCurrencyStore.getState().setCurrency('rub')

    expect(useCurrencyStore.getState().currency).toBe('rub')
  })

  it('ignores unsupported runtime values', () => {
    useCurrencyStore.getState().setCurrency('gbp' as never)

    expect(useCurrencyStore.getState().currency).toBe(DEFAULT_CURRENCY)
  })

  it('hydrates the persisted currency from local storage', async () => {
    localStorage.setItem(
      'crypto-dashboard-currency',
      JSON.stringify({ state: { currency: 'eur' }, version: 1 }),
    )

    await useCurrencyStore.persist.rehydrate()

    expect(useCurrencyStore.getState().currency).toBe('eur')
  })
})
