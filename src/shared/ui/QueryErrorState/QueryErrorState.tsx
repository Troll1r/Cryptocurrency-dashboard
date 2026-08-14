import { Button } from '../Button'
import { Card } from '../Card'

export interface QueryErrorStateProps {
  error: unknown
  fallbackMessage: string
  onRetry: () => void
  retryLabel?: string
}

export function QueryErrorState({ error, fallbackMessage, onRetry, retryLabel = 'Retry' }: QueryErrorStateProps) {
  const message = error instanceof Error ? error.message : fallbackMessage

  return (
    <Card className="space-y-3 p-5">
      <p className="text-sm text-rose-300">{message}</p>
      <Button type="button" variant="secondary" onClick={onRetry}>
        {retryLabel}
      </Button>
    </Card>
  )
}
