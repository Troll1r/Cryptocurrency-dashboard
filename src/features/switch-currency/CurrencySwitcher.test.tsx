import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCurrencyStore } from '@/entities/currency'
import { CurrencySwitcher } from './CurrencySwitcher'

describe('CurrencySwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
    useCurrencyStore.setState({ currency: 'usd' })
    useCurrencyStore.persist.clearStorage()
  })

  it('updates and persists the display currency', async () => {
    const user = userEvent.setup()
    render(<CurrencySwitcher />)

    await user.selectOptions(screen.getByLabelText('Display currency'), 'rub')

    expect(useCurrencyStore.getState().currency).toBe('rub')
    expect(localStorage.getItem('crypto-dashboard-currency')).toContain('rub')
  })
})
