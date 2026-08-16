import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  args: {
    children: 'Card content',
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {}

export const WithHeading: Story = {
  args: {
    children: (
      <div>
        <h2 className="text-xl font-semibold text-white">Market Overview</h2>
        <p className="mt-2 text-sm text-slate-400">A reusable surface for grouping related content.</p>
      </div>
    ),
  },
}
