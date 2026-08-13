import axios from 'axios'
import {
  API_REQUEST_TIMEOUT_MS,
  COINGECKO_API_BASE_URL,
  COINGECKO_API_KEY,
} from '@/shared/config'

interface ApiErrorResponse {
  error?: string
  message?: string
}

export class ApiError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getResponseMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined
  }

  const { error, message } = data as ApiErrorResponse

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return typeof message === 'string' && message.trim() ? message : undefined
}

function getDefaultErrorMessage(status: number | undefined): string {
  if (status === 401 || status === 403) {
    return 'CoinGecko API key is missing or invalid.'
  }

  if (status === 429) {
    return 'CoinGecko request limit has been reached. Please try again shortly.'
  }

  if (status) {
    return 'CoinGecko could not complete the request.'
  }

  return 'Unable to connect to CoinGecko. Please check your network connection.'
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (!axios.isAxiosError(error)) {
    return new ApiError('An unexpected error occurred while requesting market data.')
  }

  const status = error.response?.status
  const message = getResponseMessage(error.response?.data) ?? getDefaultErrorMessage(status)

  return new ApiError(message, status)
}

export const axiosInstance = axios.create({
  baseURL: COINGECKO_API_BASE_URL,
  timeout: API_REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    ...(COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {}),
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
