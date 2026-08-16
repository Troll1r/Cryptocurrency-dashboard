import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Continue',
    variant: 'primary',
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary action',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost action',
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}
