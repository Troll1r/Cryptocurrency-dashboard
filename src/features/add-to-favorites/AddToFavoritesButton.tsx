import { useFavoritesStore } from '@/entities/coin'
import { Button } from '@/shared/ui/Button'

export interface AddToFavoritesButtonProps {
  coinId: string
  coinName: string
}

export function AddToFavoritesButton({ coinId, coinName }: AddToFavoritesButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(coinId))
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const label = isFavorite ? `Remove ${coinName} from favorites` : `Add ${coinName} to favorites`

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
