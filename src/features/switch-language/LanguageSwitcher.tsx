import { useId } from 'react'
import { LANGUAGE_OPTIONS, useLanguageStore, useTranslation } from '@/shared/i18n'
import { Select } from '@/shared/ui'

export function LanguageSwitcher() {
  const id = useId()
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        {t('language.label')}
      </label>
      <Select
        id={id}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="min-w-28 font-semibold"
      >
        {LANGUAGE_OPTIONS.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  )
}
