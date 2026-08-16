import { describe, expect, it } from 'vitest'
import { formatChartData } from './formatChartData'

describe('formatChartData', () => {
  it('maps valid API points without mutating the input', () => {
    const prices = [
      [1704067200000, 42000],
      [1704153600000, 43000],
    ] as const
    const originalPrices = structuredClone(prices)

    expect(formatChartData(prices)).toEqual([
      { timestamp: 1704067200000, date: new Date(1704067200000), price: 42000 },
      { timestamp: 1704153600000, date: new Date(1704153600000), price: 43000 },
    ])
    expect(prices).toEqual(originalPrices)
  })

  it('omits invalid API points', () => {
    const prices = [
      [1704067200000, 42000],
      [Number.NaN, 43000],
      [1704240000000, Number.POSITIVE_INFINITY],
    ] as const

    expect(formatChartData(prices)).toEqual([
      { timestamp: 1704067200000, date: new Date(1704067200000), price: 42000 },
    ])
  })
})
