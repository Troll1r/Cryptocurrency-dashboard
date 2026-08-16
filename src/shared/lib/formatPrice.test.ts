import { describe, expect, it } from 'vitest'
import { formatCompactNumber, formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('formats a USD amount with the selected locale', () => {
    const expected = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.5)

    expect(formatPrice(1234.5, 'usd')).toBe(expected)
  })

  it('formats a RUB amount with a supplied locale', () => {
    const expected = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.5)

    expect(formatPrice(1234.5, 'rub', 'ru-RU')).toBe(expected)
  })

  it('keeps precision for small prices', () => {
    const expected = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(0.00001234)

    expect(formatPrice(0.00001234, 'usd')).toBe(expected)
  })

  it.each([null, undefined, Number.NaN, Number.POSITIVE_INFINITY])('returns a placeholder for %s', (value) => {
    expect(formatPrice(value, 'usd')).toBe('—')
  })
})

describe('formatCompactNumber', () => {
  it('formats finite values using compact notation', () => {
    const expected = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(1250000)

    expect(formatCompactNumber(1250000)).toBe(expected)
  })
})
