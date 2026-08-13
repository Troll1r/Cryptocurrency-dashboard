import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import type { Coin } from '@/entities/coin/model/types'
import { CoinList } from './CoinList'

const coins: Coin[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/bitcoin.png',
    currentPrice: 82000,
    marketCap: 1600000000000,
    marketCapRank: 1,
    totalVolume: 34000000000,
    high24h: 84000,
    low24h: 79000,
    priceChange24h: 1200,
    priceChangePercentage24h: 1.5,
    lastUpdated: '2026-08-13T00:00:00Z',
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/ethereum.png',
    currentPrice: 3200,
    marketCap: 380000000000,
    marketCapRank: 2,
    totalVolume: 18000000000,
    high24h: 3400,
    low24h: 3000,
    priceChange24h: -120,
    priceChangePercentage24h: -3.2,
    lastUpdated: '2026-08-13T00:00:00Z',
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://example.com/solana.png',
    currentPrice: 142,
    marketCap: 65000000000,
    marketCapRank: 7,
    totalVolume: 2800000000,
    high24h: 148,
    low24h: 130,
    priceChange24h: 10,
    priceChangePercentage24h: 7.8,
    lastUpdated: '2026-08-13T00:00:00Z',
  },
]

describe('CoinList', () => {
  afterEach(() => {
    cleanup()
  })

  it('filters coins by search query and keeps sort selection working', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CoinList coins={coins} currency="usd" />
      </MemoryRouter>,
    )

    const searchInput = screen.getByRole('searchbox', { name: /search coins/i })
    await user.type(searchInput, 'eth')

    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
    expect(screen.queryByText('Solana')).not.toBeInTheDocument()

    const sortSelect = screen.getByRole('combobox', { name: /sort by/i })
    await user.selectOptions(sortSelect, 'price')

    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('shows an empty state when the search does not match any coin', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CoinList coins={coins} currency="usd" />
      </MemoryRouter>,
    )

    await user.type(screen.getByRole('searchbox', { name: /search coins/i }), 'zzz')

    expect(screen.getByText('No coins match your search.')).toBeInTheDocument()
  })

  it('disables the load more button while loading and when there is no next page', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <MemoryRouter>
        <CoinList coins={coins} currency="usd" hasNextPage={false} onLoadMore={() => undefined} />
      </MemoryRouter>,
    )

    const button = screen.getByRole('button', { name: /show more/i })
    expect(button).toBeDisabled()

    rerender(
      <MemoryRouter>
        <CoinList coins={coins} currency="usd" hasNextPage isLoadingMore onLoadMore={() => undefined} />
      </MemoryRouter>,
    )

    const loadingButton = screen.getByRole('button', { name: /loading more/i })
    expect(loadingButton).toBeDisabled()

    await user.click(loadingButton)
  })
})
