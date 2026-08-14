# Crypto Dashboard

A responsive cryptocurrency dashboard built as a frontend portfolio project. It combines current market data, interactive price history, persisted favorites, a global display currency, and cryptocurrency conversion tools.

## Features

- Market overview with top assets, loaded market metrics, and automatic market refresh every 60 seconds
- Searchable, sortable market list with incremental pagination
- USD, EUR, and RUB display currencies persisted in browser storage
- Favorite coins persisted in localStorage, including recovery controls for unavailable assets
- Coin detail pages with 24-hour, 7-day, and 30-day price charts
- Conversion from a coin to the selected display currency on the detail page
- Conversion between two cryptocurrencies on the dedicated converter page
- Loading, error, empty, and not-found states for every user-facing data flow
- Storybook stories and unit/component tests for reusable UI and critical business logic

## Routes

| Route | Description |
|---|---|
| `/` | Market overview and top assets |
| `/market` | Searchable and sortable paginated market list |
| `/favorites` | Persisted favorite coins |
| `/coin/:id` | Coin quote, stats, chart, favorite action, and display-currency conversion |
| `/converter` | Cryptocurrency-to-cryptocurrency converter |
| `/about` | Project, stack, and architecture overview |
| Any other route | Not-found screen |

## Stack

- React 19 and TypeScript
- Vite 8 and pnpm 11
- React Router 7
- TanStack Query 5 for server state and polling
- Zustand 5 with persist middleware for browser state
- Axios and CoinGecko API
- Recharts and Tailwind CSS 4
- Vitest, React Testing Library, and Storybook
- Docker multi-stage build with nginx

## Architecture

The source follows Feature-Sliced Design:

```text
app → pages → widgets → features → entities → shared
```

Higher layers import only lower layers. Each reusable slice exposes its public API through an `index.ts` file. The detailed implementation and Gitflow roadmap is available in [md/crypto-project-implementation-gitflow-plan.md](md/crypto-project-implementation-gitflow-plan.md).

## Requirements

- Node.js 20 or newer
- pnpm 11 or newer
- Docker, only when running the containerized build

## Local development

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

The default CoinGecko base URL supports keyless public requests for low-volume educational use. Those requests have dynamic IP-based rate limits. An optional Demo API key can be set in `.env` for the Demo tier.

```dotenv
VITE_COINGECKO_API_KEY=
VITE_COINGECKO_API_BASE_URL=https://api.coingecko.com/api/v3
```

Every `VITE_*` value is embedded in the browser bundle. Do not put a private server-side secret in this file. See the [CoinGecko keyless API documentation](https://docs.coingecko.com/docs/keyless-public-api) and [API key setup guide](https://docs.coingecko.com/docs/setting-up-your-api-key) for current limits and key options.

## Commands

```bash
pnpm dev
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm storybook
pnpm build-storybook
```

## Docker

The image builds the Vite application in a Node stage and serves only the static output through a non-root nginx process on port `8080`. nginx falls back to `index.html` so direct links such as `/coin/bitcoin` continue to work.

```bash
docker build -t crypto-dashboard .
docker run --rm -p 8080:8080 crypto-dashboard
```

Optional CoinGecko configuration is passed at image build time because Vite injects environment values during the build:

```bash
docker build \
  --build-arg VITE_COINGECKO_API_KEY=your_demo_key \
  --build-arg VITE_COINGECKO_API_BASE_URL=https://api.coingecko.com/api/v3 \
  -t crypto-dashboard .
```

Open `http://localhost:8080/`, `http://localhost:8080/market`, or `http://localhost:8080/coin/bitcoin` after the container starts.

## Quality checks

Before a release, run the full local gate:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test -- --run
pnpm test:coverage
pnpm build
pnpm build-storybook
```

The test configuration enforces 80% coverage for shared formatting helpers, persisted stores, and features.

## Limitations

- The public CoinGecko endpoint is rate-limited; a `429` response is shown as a recoverable error.
- The market page loads 100 coins per page. Favorite IDs are requested in batches of at most 250 API IDs.
- Historical charts load on demand and are cached per coin, currency, and period rather than polled every minute.

## Gitflow

`main` is reserved for released versions. Features branch from `develop` using `feature/*` and merge back with `--no-ff`. The release process is deliberately separate:

```text
feature/* → develop → release/* → main
```

The repository and project source are available at [github.com/Troll1r/Cryptocurrency-dashboard](https://github.com/Troll1r/Cryptocurrency-dashboard).
