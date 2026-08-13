import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { CurrencyConverter } from './CurrencyConverter'

const mockCoin = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/bitcoin.png',
  currentPrice: 50000,
  marketCap: 1000000000000,
  marketCapRank: 1,
  totalVolume: 30000000000,
  high24h: 52000,
  low24h: 48000,
  priceChange24h: 1000,
  priceChangePercentage24h: 2.04,
  lastUpdated: '2026-08-13T12:00:00Z',
}

const mockEthereum = {
  ...mockCoin,
  id: 'ethereum',
  symbol: 'eth',
  name: 'Ethereum',
  currentPrice: 3000,
}

describe('CurrencyConverter', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders with fixed coin and default amount', () => {
    render(<CurrencyConverter coin={mockCoin} currency="usd" />)

    expect(screen.getByText('Convert Bitcoin')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
  })

  it('calculates conversion with custom amount', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter coin={mockCoin} currency="usd" />)

    const input = screen.getByDisplayValue('1')
    await user.clear(input)
    await user.type(input, '2.5')

    expect(screen.getByText('$125,000.00')).toBeInTheDocument()
  })

  it('accepts comma as decimal separator', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter coin={mockCoin} currency="usd" />)

    const input = screen.getByDisplayValue('1')
    await user.clear(input)
    await user.type(input, '1,5')

    expect(screen.getByText('$75,000.00')).toBeInTheDocument()
  })

  it('shows placeholder when amount is invalid', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter coin={mockCoin} currency="usd" />)

    const input = screen.getByDisplayValue('1')
    await user.clear(input)

    expect(screen.getByText('Enter a valid positive amount')).toBeInTheDocument()
  })

  it('renders coin selection when coins array is provided', () => {
    render(<CurrencyConverter coins={[mockCoin, mockEthereum]} currency="usd" />)

    expect(screen.getByRole('combobox', { name: 'Select cryptocurrency' })).toBeInTheDocument()
    expect(screen.getByText('Bitcoin (BTC)')).toBeInTheDocument()
    expect(screen.getByText('Ethereum (ETH)')).toBeInTheDocument()
  })

  it('updates conversion when coin selection changes', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter coins={[mockCoin, mockEthereum]} currency="usd" />)

    const select = screen.getByRole('combobox', { name: 'Select cryptocurrency' })
    await user.selectOptions(select, 'ethereum')

    expect(screen.getByText('Convert Ethereum')).toBeInTheDocument()
    expect(screen.getByText('$3,000.00')).toBeInTheDocument()
  })

  it('shows no coin message when no coins are available', () => {
    render(<CurrencyConverter coins={[]} currency="usd" />)

    expect(screen.getByText('No coin selected')).toBeInTheDocument()
  })
})
