import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from './NotFoundPage'

function renderPage() {
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  )
}

describe('NotFoundPage', () => {
  it('renders 404 status and heading', () => {
    renderPage()

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderPage()

    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(2)
  })

  it('home link goes to overview', () => {
    renderPage()

    const links = screen.getAllByRole('link')
    const homeLink = links.find((link) => link.getAttribute('href') === '/')
    expect(homeLink).toBeDefined()
  })

  it('market link navigates correctly', () => {
    renderPage()

    const links = screen.getAllByRole('link')
    const marketLink = links.find((link) => link.getAttribute('href') === '/market')
    expect(marketLink).toBeDefined()
  })
})
