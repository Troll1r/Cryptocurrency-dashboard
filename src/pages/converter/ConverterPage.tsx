import { useCoinsQuery } from '@/entities/coin'
import { useCurrencyStore } from '@/entities/currency'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Loader } from '@/shared/ui/Loader'
import { CurrencyConverter } from '@/widgets/currency-converter'

export function ConverterPage() {
  const currency = useCurrencyStore((state) => state.currency)
  const { data: coins = [], isLoading, isError, error, refetch } = useCoinsQuery({ currency })

  return (
    <section className="space-y-6 py-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Cryptocurrency Converter</h1>
        <p className="max-w-2xl text-slate-400">
          Convert one cryptocurrency into another coin instantly, with live prices refreshed every 60 seconds.
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center">
          <Loader label="Loading coins" size="lg" />
        </div>
      ) : null}

      {isError ? (
        <Card className="space-y-3 p-5">
          <p className="text-sm text-rose-300">{error instanceof Error ? error.message : 'Unable to load coins.'}</p>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : null}

      {!isLoading && !isError && coins.length === 0 ? (
        <Card className="p-5 text-center text-slate-300">No coins available right now.</Card>
      ) : null}

      {!isLoading && !isError && coins.length > 0 ? (
        <div className="max-w-2xl">
          <CurrencyConverter coins={coins} currency={currency} />
        </div>
      ) : null}
    </section>
  )
}
