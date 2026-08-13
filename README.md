# Crypto Dashboard

A cryptocurrency dashboard built with React, TypeScript, Vite, TanStack Query, Zustand, and Tailwind CSS.

## Overview

The app displays live market data, historical price charts, favorites, currency switching, and a crypto converter. It follows a Feature-Sliced Design structure and supports client-side routing for market, favorites, converter, details, about, and 404 pages.

## Stack

- React 19
- TypeScript
- Vite 8
- TanStack Query
- Zustand
- React Router
- Recharts
- Tailwind CSS 4
- Vitest + React Testing Library
- Storybook

## Routes

- `/` — overview
- `/market` — market overview and pagination
- `/favorites` — saved coins
- `/converter` — crypto converter
- `/coin/:id` — coin details and chart
- `/about` — project overview
- `/404` or any unknown path — not found page

## Local development

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm test:coverage
pnpm storybook
pnpm build-storybook
```

## Environment

Create a `.env` file based on `.env.example` and provide the CoinGecko API configuration if needed.

```bash
cp .env.example .env
```

## Docker production build

```bash
docker build -t crypto-dashboard .
docker run --rm -p 8080:80 crypto-dashboard
```

Then open:

- http://localhost:8080/
- http://localhost:8080/market
- http://localhost:8080/coin/bitcoin

The container uses a multi-stage Node build and nginx to serve the SPA with a fallback to `index.html` for client-side routes.

## Notes

- Data is fetched from the CoinGecko demo API.
- Market data is paginated and rate-limited by the API provider.
- The app persists favorites and the active currency in browser storage.
- Storybook and production build are validated in CI-style checks before release.

