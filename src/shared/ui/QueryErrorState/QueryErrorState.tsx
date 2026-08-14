import { getErrorMessage } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '../Button'
import { Card } from '../Card'

export interface QueryErrorStateProps {
  error: unknown
  fallbackMessage: string
  onRetry: () => void
  retryLabel?: string
}

export function QueryErrorState({ error, fallbackMessage, onRetry, retryLabel }: QueryErrorStateProps) {
  const { t } = useTranslation()
  const message = getErrorMessage(error, t, fallbackMessage)

  return (
    <Card className="space-y-3 p-5">
      <p className="text-sm text-rose-300">{message}</p>
      <Button type="button" variant="secondary" onClick={onRetry}>
        {retryLabel ?? t('action.retry')}
      </Button>
    </Card>
  )
}
