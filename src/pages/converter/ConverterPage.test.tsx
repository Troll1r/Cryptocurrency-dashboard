import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConverterPage } from './ConverterPage'

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

function renderPage() {
  render(<ConverterPage />)
}

describe('ConverterPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    useCoinSearchQueryMock.mockReturnValue({
      data: [],
      isFetching: false,
    })
    useCoinsQueryMock.mockReturnValue({
      data: [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          currentPrice: 68000,
          marketCap: 1300000000000,
          marketCapRank: 1,
          totalVolume: 40000000000,
          high24h: 70000,
          low24h: 65000,
          priceChange24h: 1200,
          priceChangePercentage24h: 1.79,
          lastUpdated: '2026-08-13T12:00:00Z',
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          image: 'https://example.com/ethereum.png',
          currentPrice: 2500,
          marketCap: 300000000000,
          marketCapRank: 2,
          totalVolume: 15000000000,
          high24h: 2600,
          low24h: 2400,
          priceChange24h: 50,
          priceChangePercentage24h: 2.04,
          lastUpdated: '2026-08-13T12:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('renders converter with coin selection when coins are loaded', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Cryptocurrency Converter' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select source cryptocurrency' })).toHaveValue('Bitcoin (BTC)')
    expect(screen.getByRole('combobox', { name: 'Select target cryptocurrency' })).toHaveValue('Ethereum (ETH)')
  })

  it('shows loading state', () => {
    useCoinsQueryMock.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('status', { name: 'Loading coins' })).toBeInTheDocument()
  })

  it('shows error state with retry button', () => {
    const mockRefetch = vi.fn()
    useCoinsQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: mockRefetch,
    })

    renderPage()

    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('shows empty state when no coins available', () => {
    useCoinsQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('No coins available right now.')).toBeInTheDocument()
  })
})
