import { Link } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <section className="grid min-h-72 place-items-center text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{t('notFound.title')}</h1>
        <p className="mt-3 text-slate-400">{t('notFound.description')}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            ← {t('notFound.goOverview')}
          </Link>
          <Link
            to="/market"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-900 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {t('notFound.viewMarket')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
