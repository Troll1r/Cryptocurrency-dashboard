import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import type { Coin } from '@/entities/coin'
import { formatPrice } from '@/shared/lib'
import { CoinCard } from './CoinCard'

const baseCoin: Coin = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  currentPrice: 50000,
  marketCap: 980_000_000_000,
  marketCapRank: 1,
  totalVolume: 25_000_000_000,
  high24h: 51000,
  low24h: 49000,
  priceChange24h: 500,
  priceChangePercentage24h: 1.01,
  lastUpdated: '2026-08-13T00:00:00.000Z',
}

function renderCoinCard(coin: Coin, action?: ReactNode) {
  return render(
    <MemoryRouter>
      <CoinCard coin={coin} currency="usd" action={action} />
    </MemoryRouter>,
  )
}

describe('CoinCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders coin metrics and links to the coin details page', () => {
    renderCoinCard(baseCoin)

    expect(screen.getByRole('link', { name: /Bitcoin/i })).toHaveAttribute('href', '/coin/bitcoin')
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText(formatPrice(baseCoin.currentPrice, 'usd'))).toBeInTheDocument()
    expect(screen.getByText(/MCap 980B/)).toBeInTheDocument()
    expect(screen.getByText('+1.01%')).toBeInTheDocument()
    expect(screen.getByAltText('Bitcoin logo')).toBeInTheDocument()
  })

  it('handles missing market data without breaking the layout', () => {
    renderCoinCard({
      ...baseCoin,
      currentPrice: null,
      marketCap: null,
      marketCapRank: null,
      priceChangePercentage24h: null,
    })

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('link', { name: /Bitcoin/i })).toBeInTheDocument()
  })

  it('shows a negative change with a minus sign and distinct tone', () => {
    renderCoinCard({
      ...baseCoin,
      priceChangePercentage24h: -2.35,
    })

    const change = screen.getByText('−2.35%')
    expect(change).toHaveClass('text-rose-400')
  })

  it('renders an action slot outside the navigation link', () => {
    renderCoinCard(baseCoin, <button type="button">Favorite</button>)

    const link = screen.getByRole('link', { name: /Bitcoin/i })
    const action = screen.getByRole('button', { name: 'Favorite' })

    expect(action).toBeInTheDocument()
    expect(link.contains(action)).toBe(false)
  })
})
