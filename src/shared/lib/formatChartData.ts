export type ChartPriceTuple = readonly [timestamp: number, price: number]

export interface FormattedChartPoint {
  timestamp: number
  date: Date
  price: number
}

export function formatChartData(prices: readonly ChartPriceTuple[]): FormattedChartPoint[] {
  return prices.reduce<FormattedChartPoint[]>((points, [timestamp, price]) => {
    if (Number.isFinite(timestamp) && Number.isFinite(price)) {
      points.push({
        timestamp,
        date: new Date(timestamp),
        price,
      })
    }

    return points
  }, [])
}
