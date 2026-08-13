import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ChartPeriod, ChartPoint, CurrencyCode } from '@/entities/coin/model/types'
import { formatPrice } from '@/shared/lib'
import { Card } from '@/shared/ui/Card'

export interface PriceChartProps {
  data: ChartPoint[]
  currency: CurrencyCode
  activePeriod: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

const periodLabels: Array<{ value: ChartPeriod; label: string }> = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

function formatTooltipValue(value: number | string | readonly (number | string)[] | undefined, currency: CurrencyCode): string {
  const numericValue = Array.isArray(value) ? Number(value[0]) : Number(value)

  if (!Number.isFinite(numericValue)) {
    return '—'
  }

  return formatPrice(numericValue, currency)
}

export function PriceChart({ data, currency, activePeriod, onPeriodChange }: PriceChartProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Price history</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Chart</h2>
        </div>

        <div className="flex rounded-lg border border-slate-700 bg-slate-950/80 p-1">
          {periodLabels.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onPeriodChange(value)}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activePeriod === value
                  ? 'bg-sky-400 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              ].join(' ')}
              aria-pressed={activePeriod === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 text-slate-400">
          No chart data available.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Date(Number(value)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatPrice(Number(value), currency, 'en-US')}
                width={84}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                }}
                formatter={(value) => [formatTooltipValue(value, currency), 'Price']}
                labelFormatter={(value) => new Date(Number(value)).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              />
              <Area type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} fill="url(#priceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
