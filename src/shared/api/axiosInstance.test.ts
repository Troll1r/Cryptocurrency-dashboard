import { beforeEach, describe, expect, it } from 'vitest'
import { useLanguageStore } from '@/shared/i18n'
import { ApiError, getErrorMessage, toApiError } from './axiosInstance'

function createAxiosError(status: number | undefined, data?: unknown): unknown {
  return {
    isAxiosError: true,
    response: { status, data },
  }
}

describe('toApiError', () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: 'en' })
  })

  it('assigns the api key code for 401 and 403 responses', () => {
    const error = toApiError(createAxiosError(401))

    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe('error.apiKeyInvalid')

    expect(toApiError(createAxiosError(403)).code).toBe('error.apiKeyInvalid')
  })

  it('assigns the rate limit code for 429 responses', () => {
    expect(toApiError(createAxiosError(429)).code).toBe('error.rateLimited')
  })

  it('assigns the request failed code for other statuses', () => {
    expect(toApiError(createAxiosError(500)).code).toBe('error.requestFailed')
  })

  it('assigns the network code when there is no status', () => {
    expect(toApiError(createAxiosError(undefined)).code).toBe('error.network')
  })

  it('assigns the unexpected code for non-axios errors', () => {
    expect(toApiError(new Error('boom')).code).toBe('error.unexpected')
  })

  it('keeps a server-provided message without a translation code', () => {
    const error = toApiError(createAxiosError(400, { error: 'Coin is not supported' }))

    expect(error.message).toBe('Coin is not supported')
    expect(error.code).toBeUndefined()
  })

  it('returns the passed ApiError unchanged', () => {
    const original = new ApiError('message', 500, 'error.requestFailed')

    expect(toApiError(original)).toBe(original)
  })
})

describe('getErrorMessage', () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: 'en' })
  })

  it('translates the error code through the provided function', () => {
    const error = toApiError(createAxiosError(429))

    expect(getErrorMessage(error, (key) => `[${key}]`, 'Fallback')).toBe('[error.rateLimited]')
  })

  it('returns the raw message for errors without a translation code', () => {
    const error = new Error('Raw failure')

    expect(getErrorMessage(error, (key) => `[${key}]`, 'Fallback')).toBe('Raw failure')
  })

  it('returns the fallback message for non-Error values', () => {
    expect(getErrorMessage(null, (key) => `[${key}]`, 'Fallback')).toBe('Fallback')
  })

  it('prefers a server-provided message over the fallback', () => {
    const error = toApiError(createAxiosError(400, { error: 'Coin is not supported' }))

    expect(getErrorMessage(error, (key) => `[${key}]`, 'Fallback')).toBe('Coin is not supported')
  })
})
