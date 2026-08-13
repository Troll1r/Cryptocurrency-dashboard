import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="grid gap-8 py-8 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">Crypto Dashboard</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Track cryptocurrency markets with clarity
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          Follow market prices, save coins to your watchlist and convert values in one place.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/market"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-300"
        >
          Explore market
        </Link>
        <Link
          to="/converter"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-100 transition-colors hover:border-slate-600 hover:bg-slate-900"
        >
          Open converter
        </Link>
      </div>
    </section>
  )
}
