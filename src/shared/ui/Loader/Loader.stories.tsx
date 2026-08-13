import type { Meta, StoryObj } from '@storybook/react-vite'
import { Loader } from './Loader'

const meta: Meta<typeof Loader> = {
  title: 'UI/Loader',
  component: Loader,
  args: {
    label: 'Loading',
    size: 'md',
  },
}

export default meta

type Story = StoryObj<typeof Loader>

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const CustomLabel: Story = {
  args: {
    label: 'Fetching market data…',
  },
}
