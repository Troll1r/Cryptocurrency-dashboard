import { axiosInstance } from '@/shared/api'
import { CHART_PERIODS, MARKET_PAGE_SIZE, MAX_COIN_IDS_PER_REQUEST } from '@/shared/config'
import { formatChartData } from '@/shared/lib'
import type {
  ChartPoint,
  Coin,
  CoinSearchResult,
  CoinsMarketsRequest,
  MarketChartRequest,
} from '@/entities/coin/model/types'

interface CoinMarketResponse {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  high_24h: number | null
  low_24h: number | null
  price_change_24h: number | null
  price_change_percentage_24h: number | null
  last_updated: string
}

interface MarketChartResponse {
  prices: readonly (readonly [number, number])[]
}

interface CoinSearchResponse {
  coins: readonly CoinSearchItem[]
}

interface CoinSearchItem {
  id: string
  name: string
  symbol: string
  market_cap_rank: number | null
  thumb: string
  large: string
}

function mapCoin(response: CoinMarketResponse): Coin {
  return {
    id: response.id,
    symbol: response.symbol,
    name: response.name,
    image: response.image,
    currentPrice: response.current_price,
    marketCap: response.market_cap,
    marketCapRank: response.market_cap_rank,
    totalVolume: response.total_volume,
    high24h: response.high_24h,
    low24h: response.low_24h,
    priceChange24h: response.price_change_24h,
    priceChangePercentage24h: response.price_change_percentage_24h,
    lastUpdated: response.last_updated,
  }
}

function getPage(page: number | undefined): number {
  return page && Number.isInteger(page) && page > 0 ? page : 1
}

function getChartDays(period: MarketChartRequest['period']): number {
  return CHART_PERIODS.find(({ id }) => id === period)?.days ?? 1
}

function normalizeIds(ids: readonly string[] | undefined): string[] | undefined {
  if (!ids) {
    return undefined
  }

  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
}

function splitIds(ids: readonly string[]): string[][] {
  const chunks: string[][] = []

  for (let index = 0; index < ids.length; index += MAX_COIN_IDS_PER_REQUEST) {
    chunks.push(ids.slice(index, index + MAX_COIN_IDS_PER_REQUEST))
  }

  return chunks
}

async function requestCoinsMarkets(
  currency: CoinsMarketsRequest['currency'],
  page: number | undefined,
  ids: readonly string[] | undefined,
): Promise<Coin[]> {
  const { data } = await axiosInstance.get<CoinMarketResponse[]>('/coins/markets', {
    params: {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: ids?.length ?? MARKET_PAGE_SIZE,
      page: getPage(page),
      ...(ids?.length ? { ids: ids.join(',') } : {}),
    },
  })

  return data.map(mapCoin)
}

export async function getCoinsMarkets({
  currency,
  page,
  ids,
}: CoinsMarketsRequest): Promise<Coin[]> {
  const normalizedIds = normalizeIds(ids)

  if (normalizedIds?.length === 0) {
    return []
  }

  if (!normalizedIds) {
    return requestCoinsMarkets(currency, page, undefined)
  }

  const batches = splitIds(normalizedIds)
  const responses = await Promise.all(
    batches.map((batch) => requestCoinsMarkets(currency, page, batch)),
  )

  return responses.flat()
}

export async function getMarketChart({
  id,
  currency,
  period,
}: MarketChartRequest): Promise<ChartPoint[]> {
  const { data } = await axiosInstance.get<MarketChartResponse>(
    `/coins/${encodeURIComponent(id)}/market_chart`,
    {
      params: {
        vs_currency: currency,
        days: getChartDays(period),
      },
    },
  )

  return formatChartData(data.prices)
}

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return []
  }

  const { data } = await axiosInstance.get<CoinSearchResponse>('/search', {
    params: { query: normalizedQuery },
  })

  return data.coins.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    marketCapRank: coin.market_cap_rank,
    thumb: coin.thumb,
    large: coin.large,
  }))
}
