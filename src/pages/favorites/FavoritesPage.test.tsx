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
})
