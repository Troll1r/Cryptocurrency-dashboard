import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFavoritesStore } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { useCoinsQuery } from '@/entities/coin'
import { FavoritesPage } from './FavoritesPage'

vi.mock('@/entities/coin', async () => {
  const actual = await vi.importActual<typeof import('@/entities/coin')>('@/entities/coin')

  return {
    ...actual,
    useCoinsQuery: vi.fn(),
  }
})

describe('FavoritesPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    localStorage.clear()
    useFavoritesStore.setState({ favoriteIds: [] })
    useFavoritesStore.persist.clearStorage()
    useCurrencyStore.setState({ currency: 'usd' })
    useCurrencyStore.persist.clearStorage()
    vi.mocked(useCoinsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never)
  })

  it('shows an empty state when there are no favorite coins', () => {
    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument()
  })

  it('renders favorite coins and search controls when favorites exist', () => {
    useFavoritesStore.setState({ favoriteIds: ['bitcoin'] })
    vi.mocked(useCoinsQuery).mockReturnValue({
      data: [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          currentPrice: 65000,
          marketCap: 1200000000000,
          marketCapRank: 1,
          totalVolume: 30000000000,
          high24h: 67000,
          low24h: 64000,
          priceChange24h: 1200,
          priceChangePercentage24h: 1.8,
          lastUpdated: '2026-08-13T00:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never)

    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: /search coins/i })).toBeInTheDocument()
  })

  it('allows removal of unavailable favorite IDs', async () => {
    const user = userEvent.setup()
    useFavoritesStore.setState({ favoriteIds: ['removed-coin'] })

    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('removed-coin')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(useFavoritesStore.getState().favoriteIds).toEqual([])
  })

  it('clears all favorites only after confirmation', async () => {
    const user = userEvent.setup()
    useFavoritesStore.setState({ favoriteIds: ['bitcoin', 'ethereum'] })
    vi.mocked(useCoinsQuery).mockReturnValue({
      data: [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          currentPrice: 65000,
          marketCap: 1200000000000,
          marketCapRank: 1,
          totalVolume: 30000000000,
          high24h: 67000,
          low24h: 64000,
          priceChange24h: 1200,
          priceChangePercentage24h: 1.8,
          lastUpdated: '2026-08-13T00:00:00Z',
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          image: 'https://example.com/ethereum.png',
          currentPrice: 3500,
          marketCap: 420000000000,
          marketCapRank: 2,
          totalVolume: 15000000000,
          high24h: 3600,
          low24h: 3400,
          priceChange24h: 80,
          priceChangePercentage24h: 2.3,
          lastUpdated: '2026-08-13T00:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never)

    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Clear all' }))

    expect(screen.getByRole('dialog', { name: 'Clear all favorites?' })).toBeInTheDocument()
    expect(screen.getByText(/This will remove 2 coins/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(useFavoritesStore.getState().favoriteIds).toEqual(['bitcoin', 'ethereum'])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    await user.click(screen.getByRole('button', { name: 'Yes, clear all' }))

    expect(useFavoritesStore.getState().favoriteIds).toEqual([])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
