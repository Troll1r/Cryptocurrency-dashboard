import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Select } from './Select'

describe('Select', () => {
  it('positions the right arrow with its own offset from the edge', () => {
    render(
      <Select aria-label="Sort by" value="price" onChange={() => undefined}>
        <option value="price">Price</option>
      </Select>,
    )

    const select = screen.getByRole('combobox', { name: /sort by/i })

    expect(select).toHaveClass('appearance-none')
    expect(select).toHaveClass('pr-10')
    expect(select).toHaveStyle({ backgroundPosition: 'right 0.75rem center' })
  })
})
