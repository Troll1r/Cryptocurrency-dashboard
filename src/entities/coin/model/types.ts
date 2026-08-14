import type { ChartPeriod, CurrencyCode } from '@/shared/config'

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  currentPrice: number | null
  marketCap: number | null
  marketCapRank: number | null
  totalVolume: number | null
  high24h: number | null
  low24h: number | null
  priceChange24h: number | null
  priceChangePercentage24h: number | null
  lastUpdated: string
}

export interface ChartPoint {
  timestamp: number
  date: Date
  price: number
}

export interface CoinSearchResult {
  id: string
  name: string
  symbol: string
  marketCapRank: number | null
  thumb: string
  large: string
}

export interface CoinsMarketsRequest {
  currency: CurrencyCode
  page?: number
  ids?: readonly string[]
}

export interface MarketChartRequest {
  id: string
  currency: CurrencyCode
  period: ChartPeriod
}

export type { ChartPeriod, CurrencyCode }
