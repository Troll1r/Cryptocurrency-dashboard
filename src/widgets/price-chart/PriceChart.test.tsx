import { describe, expect, it } from 'vitest'
import { formatXAxisTick } from './lib/formatXAxisTick'

describe('PriceChart', () => {
  it('shows hour labels for 24h period and date labels for longer periods', () => {
    const timestamp = new Date('2024-01-02T12:30:00Z').getTime()

    expect(formatXAxisTick(timestamp, '24h')).toMatch(/\d{1,2}:\d{2}/)
    expect(formatXAxisTick(timestamp, '7d')).toMatch(/[A-Za-z]{3}\s\d{1,2}/)
    expect(formatXAxisTick(timestamp, '30d')).toMatch(/[A-Za-z]{3}\s\d{1,2}/)
  })
})
