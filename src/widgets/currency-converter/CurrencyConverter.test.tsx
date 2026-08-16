import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CurrencyConverter } from './CurrencyConverter'

const useCoinsQueryMock = vi.fn()
const useCoinSearchQueryMock = vi.fn()

vi.mock('@/entities/coin', async () => {
  const actual = await vi.importActual<typeof import('@/entities/coin')>('@/entities/coin')

  return {
    ...actual,
    useCoinsQuery: (...args: unknown[]) => useCoinsQueryMock(...args),
    useCoinSearchQuery: (...args: unknown[]) => useCoinSearchQueryMock(...args),
  }
})

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

const mockDogwifhat = {
  ...mockCoin,
  id: 'dogwifhat',
  symbol: 'wif',
  name: 'Dogwifhat',
  currentPrice: 2.5,
}

describe('CurrencyConverter', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    useCoinsQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    useCoinSearchQueryMock.mockReturnValue({
      data: [],
      isFetching: false,
    })
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

  it('renders coin selection when coins array is provided', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter coins={[mockCoin, mockEthereum]} currency="usd" />)

    expect(screen.getByRole('combobox', { name: 'Select source cryptocurrency' })).toHaveValue('Bitcoin (BTC)')
    expect(screen.getByRole('combobox', { name: 'Select target cryptocurrency' })).toHaveValue('Ethereum (ETH)')

    await user.click(screen.getByRole('combobox', { name: 'Select source cryptocurrency' }))

    expect(screen.getByRole('option', { name: 'Bitcoin (BTC)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ethereum (ETH)' })).toBeInTheDocument()
  })

  it('converts from one coin to another and updates when selection changes', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter coins={[mockCoin, mockEthereum]} currency="usd" />)

    expect(screen.getByText('16.66666667 ETH')).toBeInTheDocument()

    const sourceSelect = screen.getByRole('combobox', { name: 'Select source cryptocurrency' })
    await user.click(sourceSelect)
    await user.click(screen.getByRole('option', { name: 'Ethereum (ETH)' }))

    expect(screen.getByText('Convert Ethereum')).toBeInTheDocument()
    expect(screen.getByText('0.06 BTC')).toBeInTheDocument()
  })

  it('allows selecting a coin beyond the loaded list via search', async () => {
    const user = userEvent.setup()
    useCoinSearchQueryMock.mockReturnValue({
      data: [
        {
          id: 'dogwifhat',
          name: 'Dogwifhat',
          symbol: 'wif',
          marketCapRank: 220,
          thumb: 'https://example.com/dogwifhat-thumb.png',
          large: 'https://example.com/dogwifhat-large.png',
        },
      ],
      isFetching: false,
    })
    useCoinsQueryMock.mockImplementation((options: { ids?: readonly string[] }) => ({
      data: options.ids?.includes('dogwifhat') ? [mockDogwifhat] : [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }))

    render(<CurrencyConverter coins={[mockCoin, mockEthereum]} currency="usd" />)

    const sourceSelect = screen.getByRole('combobox', { name: 'Select source cryptocurrency' })
    await user.click(sourceSelect)
    await user.type(sourceSelect, 'dog')
    await user.click(screen.getByRole('option', { name: 'Dogwifhat (WIF)' }))

    expect(screen.getByText('Convert Dogwifhat')).toBeInTheDocument()
    expect(screen.getByText('0.00005 BTC')).toBeInTheDocument()
  })

  it('shows no coin message when no coins are available', () => {
    render(<CurrencyConverter coins={[]} currency="usd" />)

    expect(screen.getByText('No coin selected')).toBeInTheDocument()
  })

  it('initializes both coin selections after asynchronous data loading', () => {
    const { rerender } = render(<CurrencyConverter coins={[]} currency="usd" />)

    rerender(<CurrencyConverter coins={[mockCoin, mockEthereum]} currency="usd" />)

    expect(screen.getByRole('combobox', { name: 'Select source cryptocurrency' })).toHaveValue('Bitcoin (BTC)')
    expect(screen.getByRole('combobox', { name: 'Select target cryptocurrency' })).toHaveValue('Ethereum (ETH)')
    expect(screen.getByRole('heading', { name: 'Convert Bitcoin' })).toBeInTheDocument()
  })
})
