import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLanguageStore } from '@/shared/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
    useLanguageStore.setState({ language: 'en' })
    useLanguageStore.persist.clearStorage()
  })

  it('updates and persists the selected language', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    await user.selectOptions(screen.getByLabelText('Language'), 'ru')

    expect(useLanguageStore.getState().language).toBe('ru')
    expect(localStorage.getItem('crypto-dashboard-language')).toContain('ru')
  })
})
