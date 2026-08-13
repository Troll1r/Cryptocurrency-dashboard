import type { Meta, StoryObj } from '@storybook/react-vite'
import { PriceChart } from './PriceChart'

const chartData = [
  { timestamp: 1716595200000, date: new Date(1716595200000), price: 62000 },
  { timestamp: 1716681600000, date: new Date(1716681600000), price: 63500 },
  { timestamp: 1716768000000, date: new Date(1716768000000), price: 64750 },
  { timestamp: 1716854400000, date: new Date(1716854400000), price: 64200 },
  { timestamp: 1716940800000, date: new Date(1716940800000), price: 65800 },
  { timestamp: 1717027200000, date: new Date(1717027200000), price: 67250 },
  { timestamp: 1717113600000, date: new Date(1717113600000), price: 68100 },
]

const meta: Meta<typeof PriceChart> = {
  title: 'Widgets/PriceChart',
  component: PriceChart,
  args: {
    data: chartData,
    currency: 'usd',
    activePeriod: '7d',
    onPeriodChange: () => undefined,
  },
}

export default meta

type Story = StoryObj<typeof PriceChart>

export const Weekly: Story = {}

export const Empty: Story = {
  args: {
    data: [],
  },
}
