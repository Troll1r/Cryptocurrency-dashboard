import { createBrowserRouter } from 'react-router-dom'
import { AboutPage } from '@/pages/about'
import { CoinDetailsPage } from '@/pages/coin-details'
import { ConverterPage } from '@/pages/converter'
import { FavoritesPage } from '@/pages/favorites'
import { HomePage } from '@/pages/home'
import { MarketPage } from '@/pages/market'
import { NotFoundPage } from '@/pages/not-found'
import { Layout } from '@/widgets/site-header'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'market', element: <MarketPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'coin/:id', element: <CoinDetailsPage /> },
      { path: 'converter', element: <ConverterPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
