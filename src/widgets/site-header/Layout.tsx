import { NavLink, Outlet } from 'react-router-dom'
import { CurrencySwitcher } from '@/features/switch-currency'
import { LanguageSwitcher } from '@/features/switch-language'
import { useTranslation } from '@/shared/i18n'

const navigationItems = [
  { to: '/', translationKey: 'nav.overview', end: true },
  { to: '/market', translationKey: 'nav.market', end: false },
  { to: '/favorites', translationKey: 'nav.favorites', end: false },
  { to: '/converter', translationKey: 'nav.converter', end: false },
  { to: '/about', translationKey: 'nav.about', end: false },
] as const

function getLinkClassName(isActive: boolean): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ')
}

export function Layout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 xl:contents">
            <NavLink
              to="/"
              end
              className="text-lg font-bold tracking-tight text-white transition-colors hover:text-sky-300"
            >
              Crypto Dashboard
            </NavLink>
            <div className="flex items-center gap-2 xl:order-3">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
          </div>
          <nav aria-label={t('nav.primary')} className="flex gap-1 overflow-x-auto pb-1 xl:order-2 xl:pb-0">
            {navigationItems.map(({ to, translationKey, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => getLinkClassName(isActive)}>
                {t(translationKey)}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
