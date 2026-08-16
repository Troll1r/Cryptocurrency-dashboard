import axios from 'axios'
import {
  API_REQUEST_TIMEOUT_MS,
  COINGECKO_API_BASE_URL,
  COINGECKO_API_KEY,
} from '@/shared/config'
import { translate, useLanguageStore } from '@/shared/i18n'
import type { TranslationKey } from '@/shared/i18n'

export class ApiError extends Error {
  readonly status: number | undefined
  readonly code: TranslationKey | undefined

  constructor(message: string, status?: number, code?: TranslationKey) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
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

function getDefaultErrorCode(status: number | undefined): TranslationKey {
  if (status === 401 || status === 403) {
    return 'error.apiKeyInvalid'
  }

  if (status === 429) {
    return 'error.rateLimited'
  }

  if (status) {
    return 'error.requestFailed'
  }

  return 'error.network'
}

function getCurrentLanguage(): Parameters<typeof translate>[0] {
  return useLanguageStore.getState().language
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (!axios.isAxiosError(error)) {
    const code: TranslationKey = 'error.unexpected'

    return new ApiError(translate(getCurrentLanguage(), code), undefined, code)
  }

  const status = error.response?.status
  const serverMessage = getResponseMessage(error.response?.data)

  if (serverMessage) {
    return new ApiError(serverMessage, status)
  }

  const code = getDefaultErrorCode(status)

  return new ApiError(translate(getCurrentLanguage(), code), status, code)
}

export function getErrorMessage(
  error: unknown,
  t: (key: TranslationKey) => string,
  fallbackMessage: string,
): string {
  if (error instanceof ApiError && error.code) {
    return t(error.code)
  }

  return error instanceof Error ? error.message : fallbackMessage
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
