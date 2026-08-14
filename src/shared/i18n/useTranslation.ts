import { useCallback } from 'react'
import { LANGUAGE_LOCALES, useLanguageStore } from './useLanguageStore'
import { translations } from './messages'
import type { LanguageCode, TranslationKey } from './messages'

type TranslationValues = Record<string, number | string>

function interpolate(message: string, values: TranslationValues | undefined): string {
  if (!values) {
    return message
  }

  return message.replace(/{{(\w+)}}/g, (placeholder, key: string) => {
    const value = values[key]

    return value === undefined ? placeholder : String(value)
  })
}

export function translate(language: LanguageCode, key: TranslationKey, values?: TranslationValues): string {
  return interpolate(translations[language][key], values)
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language)
  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) => translate(language, key, values),
    [language],
  )

  return { language, locale: LANGUAGE_LOCALES[language], t }
}
