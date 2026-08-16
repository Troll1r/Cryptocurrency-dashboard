import { useFavoritesStore } from '@/entities/coin'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/Button'

export interface AddToFavoritesButtonProps {
  coinId: string
  coinName: string
}

export function AddToFavoritesButton({ coinId, coinName }: AddToFavoritesButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(coinId))
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const { t } = useTranslation()
  const label = t(isFavorite ? 'favorite.remove' : 'favorite.add', { name: coinName })

  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={isFavorite}
      aria-label={label}
      onClick={() => toggleFavorite(coinId)}
      className="min-w-10 px-2"
    >
      <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
    </Button>
  )
}
