const DEFAULT_COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3'

function getEnvironmentValue(name: string): string | undefined {
  const value = import.meta.env[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export const SUPPORTED_CURRENCIES = [
  { code: 'usd', label: 'USD', locale: 'en-US' },
  { code: 'eur', label: 'EUR', locale: 'de-DE' },
  { code: 'rub', label: 'RUB', locale: 'ru-RU' },
] as const

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code']

export const DEFAULT_CURRENCY: CurrencyCode = 'usd'
export const POLLING_INTERVAL_MS = 60_000
export const MARKET_PAGE_SIZE = 100
export const DEFAULT_COIN_IDS = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana'] as const
export const CHART_PERIODS = [
  { id: '24h', label: '24h', days: 1 },
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
] as const

export type ChartPeriod = (typeof CHART_PERIODS)[number]['id']

export const API_REQUEST_TIMEOUT_MS = 10_000
export const COINGECKO_API_BASE_URL = (
  getEnvironmentValue('VITE_COINGECKO_API_BASE_URL') ?? DEFAULT_COINGECKO_API_BASE_URL
).replace(/\/+$/, '')
export const COINGECKO_API_KEY = getEnvironmentValue('VITE_COINGECKO_API_KEY')
