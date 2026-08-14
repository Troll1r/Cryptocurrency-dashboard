import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock('@/shared/api', () => ({
  axiosInstance: {
    get: mocks.get,
  },
}))

import { getCoinsMarkets, getMarketChart } from './coinApi'

describe('getCoinsMarkets', () => {
  beforeEach(() => {
    mocks.get.mockReset()
  })

  it('requests and maps market data', async () => {
    mocks.get.mockResolvedValue({
      data: [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          current_price: 68000,
          market_cap: 1350000000000,
          market_cap_rank: 1,
          total_volume: 20000000000,
          high_24h: 69000,
          low_24h: 67000,
          price_change_24h: 1000,
          price_change_percentage_24h: 1.49,
          last_updated: '2026-08-13T00:00:00.000Z',
        },
      ],
    })

    await expect(getCoinsMarkets({ currency: 'usd', page: 2 })).resolves.toEqual([
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://example.com/bitcoin.png',
        currentPrice: 68000,
        marketCap: 1350000000000,
        marketCapRank: 1,
        totalVolume: 20000000000,
        high24h: 69000,
        low24h: 67000,
        priceChange24h: 1000,
        priceChangePercentage24h: 1.49,
        lastUpdated: '2026-08-13T00:00:00.000Z',
      },
    ])

    expect(mocks.get).toHaveBeenCalledWith('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 2,
      },
    })
  })

  it('does not request data for an empty ID list', async () => {
    await expect(getCoinsMarkets({ currency: 'usd', ids: [] })).resolves.toEqual([])

    expect(mocks.get).not.toHaveBeenCalled()
  })

  it('batches more than 250 requested IDs', async () => {
    const ids = Array.from({ length: 251 }, (_, index) => `coin-${index + 1}`)
    mocks.get.mockResolvedValue({ data: [] })

    await expect(getCoinsMarkets({ currency: 'usd', ids })).resolves.toEqual([])

    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(mocks.get).toHaveBeenNthCalledWith(1, '/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        ids: ids.slice(0, 250).join(','),
      },
    })
    expect(mocks.get).toHaveBeenNthCalledWith(2, '/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 1,
        page: 1,
        ids: 'coin-251',
      },
    })
  })
})

describe('getMarketChart', () => {
  beforeEach(() => {
    mocks.get.mockReset()
  })

  it('requests the selected chart period and formats its points', async () => {
    mocks.get.mockResolvedValue({
      data: {
        prices: [[1704067200000, 42000]],
      },
    })

    await expect(
      getMarketChart({ id: 'bitcoin/cash', currency: 'eur', period: '7d' }),
    ).resolves.toEqual([
      { timestamp: 1704067200000, date: new Date(1704067200000), price: 42000 },
    ])

    expect(mocks.get).toHaveBeenCalledWith('/coins/bitcoin%2Fcash/market_chart', {
      params: {
        vs_currency: 'eur',
        days: 7,
      },
    })
  })
})
