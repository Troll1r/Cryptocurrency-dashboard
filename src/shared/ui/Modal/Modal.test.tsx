import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} title="Clear all favorites?" onClose={() => undefined}>
        <p>Modal content</p>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title and content when open', () => {
    render(
      <Modal open title="Clear all favorites?" onClose={() => undefined}>
        <p>Modal content</p>
      </Modal>,
    )

    expect(screen.getByRole('dialog', { name: 'Clear all favorites?' })).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onClose when the Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open title="Clear all favorites?" onClose={onClose}>
        <p>Modal content</p>
      </Modal>,
    )

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open title="Clear all favorites?" onClose={onClose}>
        <p>Modal content</p>
      </Modal>,
    )

    const backdrop = document.body.querySelector('[aria-hidden="true"]')

    expect(backdrop).not.toBeNull()

    await user.click(backdrop as HTMLElement)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when the dialog content is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open title="Clear all favorites?" onClose={onClose}>
        <p>Modal content</p>
      </Modal>,
    )

    await user.click(screen.getByRole('dialog'))

    expect(onClose).not.toHaveBeenCalled()
  })
})
