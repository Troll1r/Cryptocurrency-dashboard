import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="grid min-h-72 place-items-center text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Page not found</h1>
        <p className="mt-3 text-slate-400">The page you requested does not exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-300"
        >
          Go to overview
        </Link>
      </div>
    </section>
  )
}
