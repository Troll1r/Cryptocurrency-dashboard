import { NavLink, Outlet } from 'react-router-dom'
import { CurrencySwitcher } from '@/features/switch-currency'

const navigationItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/market', label: 'Market', end: false },
  { to: '/favorites', label: 'Favorites', end: false },
  { to: '/converter', label: 'Converter', end: false },
  { to: '/about', label: 'About', end: false },
] as const

function getLinkClassName(isActive: boolean): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ')
}

export function Layout() {
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
            <div className="xl:order-3">
              <CurrencySwitcher />
            </div>
          </div>
          <nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto pb-1 xl:order-2 xl:pb-0">
            {navigationItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => getLinkClassName(isActive)}>
                {label}
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
