import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SearchableSelect } from './SearchableSelect'
import type { SearchableSelectOption } from './SearchableSelect'

const options: SearchableSelectOption[] = [
  { value: 'bitcoin', label: 'Bitcoin (BTC)' },
  { value: 'ethereum', label: 'Ethereum (ETH)' },
  { value: 'solana', label: 'Solana (SOL)' },
]

const meta: Meta<typeof SearchableSelect> = {
  title: 'UI/SearchableSelect',
  component: SearchableSelect,
  args: {
    options,
    ariaLabel: 'Select coin',
    placeholder: 'Search coins by name or symbol',
    onQueryChange: () => undefined,
  },
}

export default meta

type Story = StoryObj<typeof SearchableSelect>

function Interactive(args: React.ComponentProps<typeof SearchableSelect>) {
  const [value, setValue] = useState<string | undefined>('bitcoin')

  return <SearchableSelect {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
  render: (args) => <Interactive {...args} />,
}

export const WithSelectedValue: Story = {
  args: {
    value: 'bitcoin',
  },
}

export const Empty: Story = {
  args: {
    options: [],
    emptyMessage: 'No options found',
  },
}

export const Loading: Story = {
  args: {
    options: [],
    isLoading: true,
  },
}
