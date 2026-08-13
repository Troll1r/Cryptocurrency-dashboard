import { beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from './useFavoritesStore'

describe('useFavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useFavoritesStore.setState({ favoriteIds: [] })
    useFavoritesStore.persist.clearStorage()
  })

  it('adds and removes a coin without creating duplicates', () => {
    useFavoritesStore.getState().toggleFavorite('bitcoin')
    useFavoritesStore.getState().toggleFavorite('bitcoin')
    useFavoritesStore.getState().toggleFavorite('bitcoin')

    expect(useFavoritesStore.getState().favoriteIds).toEqual(['bitcoin'])
    expect(useFavoritesStore.getState().isFavorite('bitcoin')).toBe(true)

    useFavoritesStore.getState().toggleFavorite('bitcoin')

    expect(useFavoritesStore.getState().favoriteIds).toEqual([])
    expect(useFavoritesStore.getState().isFavorite('bitcoin')).toBe(false)
  })

  it('ignores blank IDs and clears all favorites', () => {
    useFavoritesStore.getState().toggleFavorite('   ')
    useFavoritesStore.getState().toggleFavorite('ethereum')
    useFavoritesStore.getState().clearFavorites()

    expect(useFavoritesStore.getState().favoriteIds).toEqual([])
  })

  it('hydrates persisted IDs from local storage', async () => {
    localStorage.setItem(
      'crypto-dashboard-favorites',
      JSON.stringify({ state: { favoriteIds: ['bitcoin', 'ethereum'] }, version: 1 }),
    )

    await useFavoritesStore.persist.rehydrate()

    expect(useFavoritesStore.getState().favoriteIds).toEqual(['bitcoin', 'ethereum'])
  })
})
