import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Coin } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import type { CurrencyCode } from '@/shared/config'
import { MarketPage } from './MarketPage'

const useCoinsQueryMock = vi.fn()

interface UseCoinsQueryOptions {
  currency: CurrencyCode
  page?: number
}

vi.mock('@/entities/coin', async () => {
  const actual = await vi.importActual<typeof import('@/entities/coin')>('@/entities/coin')

  return {
    ...actual,
    useCoinsQuery: (options: UseCoinsQueryOptions) => useCoinsQueryMock(options),
  }
})

function createCoin(id: string, name: string): Coin {
  return {
    id,
    symbol: id.slice(0, 3),
    name,
    image: `https://example.com/${id}.png`,
    currentPrice: 100,
    marketCap: 1000,
    marketCapRank: 1,
    totalVolume: 100,
    high24h: 110,
    low24h: 90,
    priceChange24h: 1,
    priceChangePercentage24h: 1,
    lastUpdated: '2026-08-14T00:00:00.000Z',
  }
}

const usdFirstPage = [
  createCoin('bitcoin', 'Bitcoin'),
  ...Array.from({ length: 99 }, (_, index) => createCoin(`usd-coin-${index + 2}`, `USD coin ${index + 2}`)),
]

const marketData: Record<CurrencyCode, Record<number, Coin[]>> = {
  usd: {
    1: usdFirstPage,
    2: [createCoin('ethereum', 'Ethereum')],
  },
  eur: {
    1: [createCoin('solana', 'Solana')],
  },
  rub: {
    1: [],
  },
}

describe('MarketPage', () => {
  beforeEach(() => {
    useCurrencyStore.setState({ currency: 'usd' })
    useCoinsQueryMock.mockImplementation(({ currency, page = 1 }: UseCoinsQueryOptions) => ({
      data: marketData[currency][page] ?? [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }))
  })

  it('resets the loaded market list when the display currency changes', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MarketPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show more' }))

    await waitFor(() => expect(screen.getByText('Ethereum')).toBeInTheDocument())
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()

    useCurrencyStore.getState().setCurrency('eur')

    await waitFor(() => expect(screen.getByText('Solana')).toBeInTheDocument())

    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument()
    expect(useCoinsQueryMock).toHaveBeenLastCalledWith({ currency: 'eur', page: 1 })
  })
})
