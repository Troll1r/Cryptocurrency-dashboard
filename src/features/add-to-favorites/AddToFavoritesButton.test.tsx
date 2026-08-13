import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from '@/entities/coin'
import { AddToFavoritesButton } from './AddToFavoritesButton'

function renderButton(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/"
          element={<AddToFavoritesButton coinId="bitcoin" coinName="Bitcoin" />}
        />
        <Route path="/coin/:id" element={<div>Coin details</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AddToFavoritesButton', () => {
  beforeEach(() => {
    localStorage.clear()
    useFavoritesStore.setState({ favoriteIds: [] })
    useFavoritesStore.persist.clearStorage()
  })

  afterEach(() => {
    cleanup()
  })

  it('starts unfavorited and exposes an accessible label', () => {
    renderButton()

    expect(screen.getByRole('button', { name: 'Add Bitcoin to favorites' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles favorite state on click', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: 'Add Bitcoin to favorites' }))

    expect(useFavoritesStore.getState().isFavorite('bitcoin')).toBe(true)
    expect(screen.getByRole('button', { name: 'Remove Bitcoin from favorites' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Remove Bitcoin from favorites' }))

    expect(useFavoritesStore.getState().isFavorite('bitcoin')).toBe(false)
  })

  it('does not navigate when clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <AddToFavoritesButton coinId="bitcoin" coinName="Bitcoin" />
                <a href="/coin/bitcoin">Open Bitcoin</a>
              </div>
            }
          />
          <Route path="/coin/:id" element={<div>Coin details</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add Bitcoin to favorites' }))

    expect(screen.queryByText('Coin details')).not.toBeInTheDocument()
  })
})
