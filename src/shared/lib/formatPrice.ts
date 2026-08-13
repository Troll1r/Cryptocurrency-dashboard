import { SUPPORTED_CURRENCIES } from '@/shared/config'
import type { CurrencyCode } from '@/shared/config'

type PriceValue = number | null | undefined

function isFiniteNumber(value: PriceValue): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function getCurrencyLocale(currency: CurrencyCode): string {
  return SUPPORTED_CURRENCIES.find(({ code }) => code === currency)?.locale ?? 'en-US'
}

function getFractionDigits(value: number): { minimum: number; maximum: number } {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 0.01 || absoluteValue === 0) {
    return { minimum: 2, maximum: 2 }
  }

  if (absoluteValue >= 0.0001) {
    return { minimum: 4, maximum: 6 }
  }

  return { minimum: 6, maximum: 8 }
}

export function formatPrice(value: PriceValue, currency: CurrencyCode, locale = getCurrencyLocale(currency)): string {
  if (!isFiniteNumber(value)) {
    return '—'
  }

  const fractionDigits = getFractionDigits(value)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: fractionDigits.minimum,
    maximumFractionDigits: fractionDigits.maximum,
  }).format(value)
}

export function formatCompactNumber(value: PriceValue, locale = 'en-US'): string {
  if (!isFiniteNumber(value)) {
    return '—'
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}
