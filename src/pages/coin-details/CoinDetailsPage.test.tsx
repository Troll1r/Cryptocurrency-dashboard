import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFavoritesStore } from '@/entities/coin'
import { CoinDetailsPage } from './CoinDetailsPage'

const useCoinsQueryMock = vi.fn()
const useMarketChartQueryMock = vi.fn()

vi.mock('@/entities/coin', async () => {
  const actual = await vi.importActual<typeof import('@/entities/coin')>('@/entities/coin')

  return {
    ...actual,
    useCoinsQuery: (...args: unknown[]) => useCoinsQueryMock(...args),
    useMarketChartQuery: (...args: unknown[]) => useMarketChartQueryMock(...args),
  }
})

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/coin/bitcoin']}>
      <Routes>
        <Route path="/coin/:id" element={<CoinDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CoinDetailsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    useFavoritesStore.setState({ favoriteIds: [] })
    useFavoritesStore.persist.clearStorage()

    useCoinsQueryMock.mockReturnValue({
      data: [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          currentPrice: 68150.25,
          marketCap: 1340000000000,
          marketCapRank: 1,
          totalVolume: 42000000000,
          high24h: 70000,
          low24h: 65000,
          priceChange24h: 1250.12,
          priceChangePercentage24h: 1.87,
          lastUpdated: '2026-08-13T12:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    useMarketChartQueryMock.mockReturnValue({
      data: [
        { timestamp: 1, date: new Date(1), price: 65000 },
        { timestamp: 2, date: new Date(2), price: 66000 },
        { timestamp: 3, date: new Date(3), price: 68000 },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('renders coin price, market stats and action controls', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument()
    expect(screen.getAllByText('$68,150.25').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Add Bitcoin to favorites' })).toBeInTheDocument()
    expect(screen.getByText('Market cap')).toBeInTheDocument()
    expect(screen.getByText('24h range')).toBeInTheDocument()
  })
})
