import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LanguageCode } from './messages'

export const LANGUAGE_OPTIONS: ReadonlyArray<{ code: LanguageCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'pl', label: 'Polski' },
]

export const LANGUAGE_LOCALES: Record<LanguageCode, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  pl: 'pl-PL',
}

interface LanguageState {
  language: LanguageCode
  setLanguage: (language: string) => void
}

type PersistedLanguageState = Pick<LanguageState, 'language'>

function isLanguageCode(language: string): language is LanguageCode {
  return LANGUAGE_OPTIONS.some(({ code }) => code === language)
}

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<PersistedLanguageState>(() => window.localStorage)

export const useLanguageStore = create<LanguageState>()(
  persist<LanguageState, [], [], PersistedLanguageState>(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        if (isLanguageCode(language)) {
          set({ language })
        }
      },
    }),
    {
      name: 'crypto-dashboard-language',
      storage,
      partialize: ({ language }) => ({ language }),
      version: 1,
    },
  ),
)
