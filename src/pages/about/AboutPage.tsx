import { Link } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import { Card } from '@/shared/ui/Card'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-8 py-4">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-white">{t('about.title')}</h1>
        <p className="max-w-2xl text-lg text-slate-400">
          {t('about.intro')}
        </p>
      </header>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-semibold text-white">{t('about.scope')}</h2>
          <p className="mt-2 text-slate-300">
            {t('about.scopeDescription')}
          </p>
        </div>
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">{t('about.features')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{t('about.featureMarket')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{t('about.featureSearch')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{t('about.featureCharts')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{t('about.featurePreferences')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{t('about.featureConverter')}</span>
            </li>
          </ul>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">{t('about.stack')}</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>
              <span className="font-medium text-slate-200">{t('about.frontend')}</span> React 19 with TypeScript
            </p>
            <p>
              <span className="font-medium text-slate-200">{t('about.tooling')}</span> Vite 8, pnpm
            </p>
            <p>
              <span className="font-medium text-slate-200">{t('about.state')}</span> Zustand, TanStack Query
            </p>
            <p>
              <span className="font-medium text-slate-200">{t('about.ui')}</span> React Router, Recharts, Tailwind CSS 4
            </p>
            <p>
              <span className="font-medium text-slate-200">{t('about.testing')}</span> Vitest, React Testing Library
            </p>
            <p>
              <span className="font-medium text-slate-200">{t('about.data')}</span> CoinGecko API (Demo)
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">{t('about.architecture')}</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>
              {t('about.architectureDescription')}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>
                  <span className="font-medium text-slate-200">app</span> — {t('about.layerApp')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>
                  <span className="font-medium text-slate-200">pages</span> — {t('about.layerPages')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>
                  <span className="font-medium text-slate-200">widgets</span> — {t('about.layerWidgets')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>
                  <span className="font-medium text-slate-200">features</span> — {t('about.layerFeatures')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>
                  <span className="font-medium text-slate-200">entities</span> — {t('about.layerEntities')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>
                  <span className="font-medium text-slate-200">shared</span> — {t('about.layerShared')}
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{t('about.performance')}</h2>
          <p className="mt-2 text-sm text-slate-300">
            {t('about.performanceDescription')}
          </p>
        </div>
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">{t('about.apiLimits')}</h3>
          <p className="mt-2 text-sm text-slate-300">
            {t('about.apiLimitsDescription')}
          </p>
        </div>
      </Card>

      <Card className="space-y-3 p-5 text-center">
        <h2 className="text-lg font-semibold text-white">{t('about.sourceCode')}</h2>
        <p className="text-sm text-slate-400">
          {t('about.sourceDescription')}
        </p>
        <a
          href="https://github.com/Troll1r/Cryptocurrency-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {t('about.viewGithub')}
        </a>
      </Card>

      <nav className="border-t border-slate-800 pt-6">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-900 hover:text-slate-100"
        >
          ← {t('about.backToMarket')}
        </Link>
      </nav>
    </section>
  )
}
