import axios from 'axios'
import {
  API_REQUEST_TIMEOUT_MS,
  COINGECKO_API_BASE_URL,
  COINGECKO_API_KEY,
} from '@/shared/config'
import { translate, useLanguageStore } from '@/shared/i18n'

export class ApiError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getStringProperty(data: object, property: string): string | undefined {
  const value = Reflect.get(data, property)

  return typeof value === 'string' && value.trim() ? value : undefined
}

function getResponseMessage(data: unknown): string | undefined {
  if (data === null || typeof data !== 'object') {
    return undefined
  }

  return getStringProperty(data, 'error') ?? getStringProperty(data, 'message')
}

function getDefaultErrorMessage(status: number | undefined): string {
  const language = useLanguageStore.getState().language

  if (status === 401 || status === 403) {
    return translate(language, 'error.apiKeyInvalid')
  }

  if (status === 429) {
    return translate(language, 'error.rateLimited')
  }

  if (status) {
    return translate(language, 'error.requestFailed')
  }

  return translate(language, 'error.network')
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (!axios.isAxiosError(error)) {
    const language = useLanguageStore.getState().language

    return new ApiError(translate(language, 'error.unexpected'))
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
