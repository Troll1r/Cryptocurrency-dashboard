import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  args: {
    defaultValue: 'bitcoin',
    children: (
      <>
        <option value="bitcoin">Bitcoin (BTC)</option>
        <option value="ethereum">Ethereum (ETH)</option>
        <option value="solana">Solana (SOL)</option>
      </>
    ),
  },
}

export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
