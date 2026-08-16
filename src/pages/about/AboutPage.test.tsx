import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AboutPage } from './AboutPage'

function renderPage() {
  render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  )
}

describe('AboutPage', () => {
  it('renders project title', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'About this project' })).toBeInTheDocument()
  })

  it('displays project features', () => {
    renderPage()

    const features = screen.getAllByText('Market overview with metrics and top movers')
    expect(features.length).toBeGreaterThan(0)
  })

  it('displays technology stack section', () => {
    renderPage()

    const stackElements = screen.getAllByText('Technology stack')
    expect(stackElements.length).toBeGreaterThan(0)
  })

  it('displays architecture section', () => {
    renderPage()

    const archElements = screen.getAllByText('Architecture')
    expect(archElements.length).toBeGreaterThan(0)
  })

  it('renders github link', () => {
    renderPage()

    const links = screen.getAllByRole('link')
    const githubLink = links.find((link) => link.getAttribute('href')?.includes('github.com'))
    expect(githubLink).toBeDefined()
  })

  it('renders back link to home', () => {
    renderPage()

    const links = screen.getAllByRole('link')
    const backLink = links.find((link) => link.getAttribute('href') === '/')
    expect(backLink).toBeDefined()
  })
})
