import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface FavoritesState {
  favoriteIds: string[]
  toggleFavorite: (coinId: string) => void
  isFavorite: (coinId: string) => boolean
  clearFavorites: () => void
}

type PersistedFavoritesState = Pick<FavoritesState, 'favoriteIds'>

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<PersistedFavoritesState>(() => window.localStorage)

export const useFavoritesStore = create<FavoritesState>()(
  persist<FavoritesState, [], [], PersistedFavoritesState>(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (coinId) => {
        const normalizedId = coinId.trim()

        if (!normalizedId) {
          return
        }

        set(({ favoriteIds }) => ({
          favoriteIds: favoriteIds.includes(normalizedId)
            ? favoriteIds.filter((id) => id !== normalizedId)
            : [...favoriteIds, normalizedId],
        }))
      },
      isFavorite: (coinId) => get().favoriteIds.includes(coinId.trim()),
      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'crypto-dashboard-favorites',
      storage,
      partialize: ({ favoriteIds }) => ({ favoriteIds }),
      version: 1,
    },
  ),
)
