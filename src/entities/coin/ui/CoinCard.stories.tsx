import type { Meta, StoryObj } from '@storybook/react-vite'
import { CoinCard } from './CoinCard'

const coin = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  currentPrice: 68000,
  marketCap: 1340000000000,
  marketCapRank: 1,
  totalVolume: 30000000000,
  high24h: 70000,
  low24h: 65000,
  priceChange24h: 1200,
  priceChangePercentage24h: 1.75,
  lastUpdated: '2026-08-13T00:00:00Z',
}

const meta: Meta<typeof CoinCard> = {
  title: 'Entities/CoinCard',
  component: CoinCard,
  args: {
    coin,
    currency: 'usd',
  },
}

export default meta

type Story = StoryObj<typeof CoinCard>

export const Positive: Story = {}

export const Negative: Story = {
  args: {
    coin: { ...coin, priceChangePercentage24h: -4.6, currentPrice: 64200 },
  },
}

export const WithoutAction: Story = {
  args: {
    action: undefined,
  },
}
