import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SearchableSelect } from './SearchableSelect'
import type { SearchableSelectOption } from './SearchableSelect'

const options: SearchableSelectOption[] = [
  { value: 'bitcoin', label: 'Bitcoin (BTC)' },
  { value: 'ethereum', label: 'Ethereum (ETH)' },
]

describe('SearchableSelect', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows the selected label when closed', () => {
    render(
      <SearchableSelect
        options={options}
        value="bitcoin"
        onChange={() => undefined}
        onQueryChange={() => undefined}
        ariaLabel="Select coin"
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Select coin' })).toHaveValue('Bitcoin (BTC)')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens the listbox on focus and reports the query as the user types', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()

    render(
      <SearchableSelect
        options={options}
        value={undefined}
        onChange={() => undefined}
        onQueryChange={onQueryChange}
        ariaLabel="Select coin"
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Select coin' })
    await user.click(input)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Bitcoin (BTC)' })).toBeInTheDocument()

    await user.type(input, 'eth')

    expect(onQueryChange).toHaveBeenLastCalledWith('eth')
  })

  it('selects an option on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SearchableSelect
        options={options}
        value={undefined}
        onChange={onChange}
        onQueryChange={() => undefined}
        ariaLabel="Select coin"
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Select coin' })
    await user.click(input)
    await user.click(screen.getByRole('option', { name: 'Ethereum (ETH)' }))

    expect(onChange).toHaveBeenCalledWith('ethereum')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects the active option with the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SearchableSelect
        options={options}
        value={undefined}
        onChange={onChange}
        onQueryChange={() => undefined}
        ariaLabel="Select coin"
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Select coin' })
    await user.click(input)
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith('bitcoin')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()

    render(
      <SearchableSelect
        options={options}
        value={undefined}
        onChange={() => undefined}
        onQueryChange={() => undefined}
        ariaLabel="Select coin"
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Select coin' })
    await user.click(input)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows the empty message when there are no options', async () => {
    const user = userEvent.setup()

    render(
      <SearchableSelect
        options={[]}
        value={undefined}
        onChange={() => undefined}
        onQueryChange={() => undefined}
        ariaLabel="Select coin"
        emptyMessage="Nothing here"
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Select coin' }))

    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('shows the loading message while options are being fetched', async () => {
    const user = userEvent.setup()

    render(
      <SearchableSelect
        options={[]}
        value={undefined}
        onChange={() => undefined}
        onQueryChange={() => undefined}
        ariaLabel="Select coin"
        isLoading
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Select coin' }))

    expect(screen.getByText('Searching…')).toBeInTheDocument()
  })
})
