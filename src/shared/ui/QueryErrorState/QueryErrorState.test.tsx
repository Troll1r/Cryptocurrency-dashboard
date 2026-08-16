import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QueryErrorState } from './QueryErrorState'

describe('QueryErrorState', () => {
  it('renders an error message and retries the query', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(<QueryErrorState error={new Error('Request failed')} fallbackMessage="Fallback message" onRetry={onRetry} />)

    expect(screen.getByText('Request failed')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders the fallback message for a non-Error value', () => {
    render(<QueryErrorState error={null} fallbackMessage="Fallback message" onRetry={() => undefined} />)

    expect(screen.getByText('Fallback message')).toBeInTheDocument()
  })
})
