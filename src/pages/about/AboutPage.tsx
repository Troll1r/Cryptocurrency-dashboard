import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'

export function AboutPage() {
  return (
    <section className="space-y-8 py-4">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-white">About this project</h1>
        <p className="max-w-2xl text-lg text-slate-400">
          A frontend learning project demonstrating real-world cryptocurrency market tracking with React, TypeScript, and
          modern tooling.
        </p>
      </header>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-semibold text-white">Project scope</h2>
          <p className="mt-2 text-slate-300">
            The dashboard displays live cryptocurrency prices fetched every 60 seconds, provides interactive price charts
            across multiple time periods, allows saving favorite coins to browser storage, and includes a real-time
            converter for cryptocurrency valuations.
          </p>
        </div>
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Main features</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>Market overview with metrics and top movers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>Searchable and sortable coin listings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>Price history charts with multiple time ranges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>Persisted favorites and currency preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>Real-time cryptocurrency converter</span>
            </li>
          </ul>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Technology stack</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>
              <span className="font-medium text-slate-200">Frontend:</span> React 19 with TypeScript
            </p>
            <p>
              <span className="font-medium text-slate-200">Tooling:</span> Vite 8, pnpm
            </p>
            <p>
              <span className="font-medium text-slate-200">State:</span> Zustand, TanStack Query
            </p>
            <p>
              <span className="font-medium text-slate-200">UI:</span> React Router, Recharts, Tailwind CSS 4
            </p>
            <p>
              <span className="font-medium text-slate-200">Testing:</span> Vitest, React Testing Library
            </p>
            <p>
              <span className="font-medium text-slate-200">Data:</span> CoinGecko API (Demo)
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Architecture</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>
              The application follows{' '}
              <span className="font-medium text-slate-200">Feature-Sliced Design (FSD)</span>, organizing code into
              distinct layers:
            </p>
            <ul className="mt-2 space-y-1">
              <li>• <span className="font-medium text-slate-200">app</span> — initialization and routing</li>
              <li>• <span className="font-medium text-slate-200">pages</span> — route-specific layouts</li>
              <li>• <span className="font-medium text-slate-200">widgets</span> — reusable UI blocks</li>
              <li>• <span className="font-medium text-slate-200">features</span> — user actions</li>
              <li>• <span className="font-medium text-slate-200">entities</span> — business logic</li>
              <li>• <span className="font-medium text-slate-200">shared</span> — primitives and utilities</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Data and performance</h2>
          <p className="mt-2 text-sm text-slate-300">
            Market data is fetched every 60 seconds with automatic refetching to provide up-to-date prices. Price history
            charts are cached after the initial load and refetched only when the time period changes. User preferences
            (favorite coins and display currency) are persisted in browser storage and survive page reloads.
          </p>
        </div>
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">API limits</h3>
          <p className="mt-2 text-sm text-slate-300">
            This dashboard uses the CoinGecko Demo API, which displays the top 100 cryptocurrencies. Initial page load
            requests these top 100 coins. Additional coins are loaded via pagination on the market page. The converter and
            chart data are fetched on-demand for specific coins.
          </p>
        </div>
      </Card>

      <Card className="space-y-3 p-5 text-center">
        <h2 className="text-lg font-semibold text-white">Source code</h2>
        <p className="text-sm text-slate-400">
          This project is built as a learning exercise for frontend development. View the source code on GitHub.
        </p>
        <a
          href="https://github.com/Troll1r/Cryptocurrency-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          View on GitHub
        </a>
      </Card>

      <nav className="border-t border-slate-800 pt-6">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-900 hover:text-slate-100"
        >
          ← Back to market
        </Link>
      </nav>
    </section>
  )
}
