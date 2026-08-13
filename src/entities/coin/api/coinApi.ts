import { axiosInstance } from '@/shared/api'
import { CHART_PERIODS, MARKET_PAGE_SIZE } from '@/shared/config'
import { formatChartData } from '@/shared/lib'
import type {
  ChartPoint,
  Coin,
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

export async function getCoinsMarkets({
  currency,
  page,
  ids,
}: CoinsMarketsRequest): Promise<Coin[]> {
  if (ids?.length === 0) {
    return []
  }

  const { data } = await axiosInstance.get<CoinMarketResponse[]>('/coins/markets', {
    params: {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: MARKET_PAGE_SIZE,
      page: getPage(page),
      ...(ids?.length ? { ids: ids.join(',') } : {}),
    },
  })

  return data.map(mapCoin)
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
