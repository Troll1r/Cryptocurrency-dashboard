# Crypto Dashboard — полная спецификация проекта

## Описание проекта

Многостраничный крипто-сайт (пет-проект) с автообновляемыми котировками, кастомными
графиками цены, избранными монетами и конвертером валют. Делается как учебный проект для
портфолио перед собеседованиями на frontend-стажировку, с жёстким дедлайном — 4 дня.

**Что показывает сайт:**
- Актуальные цены криптовалют, которые сами обновляются в реальном времени (polling раз в 60 сек)
- Интерактивные графики истории цены с переключением периода: 24 часа / 7 дней / 30 дней
- Список «избранных» монет, который сохраняется между визитами (localStorage)
- Конвертер: сколько выбранная монета стоит в введённом количестве, в выбранной валюте отображения
- Переключение валюты отображения (USD/EUR/RUB и т.д.) — влияет на все цены на сайте сразу

**Страницы сайта:**

| Путь | Страница | Функционал |
|---|---|---|
| `/` | Главная | Обзорные метрики, мини-список из 5 монет, ссылки на разделы |
| `/market` | Рынок | Полный список всех монет, поиск, (опционально) сортировка |
| `/favorites` | Избранное | Только монеты, добавленные в избранное; пустое состояние, если пусто |
| `/coin/:id` | Детали монеты | Крупная цена, график с переключателем периода, конвертер, кнопка избранного |
| `/converter` | Конвертер | Тот же виджет конвертера, но как отдельный инструмент с выбором любой монеты |
| `/about` | О проекте | Статика: описание, стек, ссылка на GitHub |

## Технологический стек

**Основа:** React + TypeScript, Vite (сборщик), pnpm (менеджер пакетов)

**Состояние:**
- Zustand — клиентское состояние (список избранных монет id, выбранная валюта отображения), с middleware `persist` для сохранения в localStorage
- TanStack Query — серверное состояние (котировки и графики с CoinGecko), кэширование, автообновление через `refetchInterval`

**Данные:**
- Axios — HTTP-клиент для запросов
- CoinGecko API (Demo API key) — источник котировок и исторических данных

**UI:**
- Recharts — графики истории цены
- Tailwind CSS — стилизация
- React Router — маршрутизация между 6 страницами

**Архитектура:** Feature-Sliced Design (FSD) — слои `app → pages → widgets → features → entities → shared`

**Инфраструктура и качество:**
- Docker — контейнеризация (multi-stage build: сборка → nginx для раздачи статики)
- Vitest + React Testing Library — юнит-тесты (Vitest вместо Jest: та же логика тестирования и API, но работает с Vite/TS без дополнительной настройки трансформации, в отличие от Jest — это осознанный инженерный выбор под конкретный стек, можно так и объяснить на защите)
- Storybook — изолированная документация ключевых UI-компонентов
- GitFlow — ветки `main`/`develop`/`feature/*`/`release/*`

## Полная файловая структура

```
crypto-dashboard/
├── .storybook/
│   ├── main.ts                        # конфигурация Storybook
│   └── preview.ts                     # глобальные настройки для всех историй (например, подключение Tailwind)
├── public/
│   └── favicon.svg
├── src/
│   │
│   ├── app/                           # инициализация приложения целиком
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx        # обёртка с QueryClientProvider
│   │   │   └── index.ts
│   │   ├── router/
│   │   │   ├── routes.tsx               # createBrowserRouter, все 6 путей
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── index.css                # @import "tailwindcss"
│   │   └── App.tsx                      # корневой компонент, собирает провайдеры + роутер
│   │
│   ├── pages/                         # по одной папке на каждый маршрут
│   │   ├── home/
│   │   │   ├── HomePage.tsx
│   │   │   └── index.ts
│   │   ├── market/
│   │   │   ├── MarketPage.tsx
│   │   │   └── index.ts
│   │   ├── favorites/
│   │   │   ├── FavoritesPage.tsx
│   │   │   └── index.ts
│   │   ├── coin-details/
│   │   │   ├── CoinDetailsPage.tsx      # читает :id через useParams
│   │   │   └── index.ts
│   │   ├── converter/
│   │   │   ├── ConverterPage.tsx
│   │   │   └── index.ts
│   │   └── about/
│   │       ├── AboutPage.tsx            # статика, без запросов
│   │       └── index.ts
│   │
│   ├── widgets/                       # крупные самостоятельные блоки, собранные из entities/features
│   │   ├── site-header/
│   │   │   ├── Layout.tsx               # шапка с NavLink на все страницы + <Outlet />
│   │   │   ├── Layout.stories.tsx
│   │   │   └── index.ts
│   │   ├── coin-list/
│   │   │   ├── CoinList.tsx             # список монет; используется на /, /market, /favorites
│   │   │   ├── CoinList.test.tsx
│   │   │   └── index.ts
│   │   ├── price-chart/
│   │   │   ├── PriceChart.tsx           # график + переключатель 24ч/7д/30д
│   │   │   ├── PriceChart.stories.tsx
│   │   │   └── index.ts
│   │   └── currency-converter/
│   │       ├── CurrencyConverter.tsx    # используется на /coin/:id и /converter
│   │       ├── CurrencyConverter.test.tsx
│   │       └── index.ts
│   │
│   ├── features/                      # конкретные действия пользователя
│   │   ├── add-to-favorites/
│   │   │   ├── AddToFavoritesButton.tsx
│   │   │   ├── AddToFavoritesButton.test.tsx
│   │   │   └── index.ts
│   │   └── switch-currency/
│   │       ├── CurrencySwitcher.tsx
│   │       └── index.ts
│   │
│   ├── entities/                      # бизнес-сущности
│   │   ├── coin/
│   │   │   ├── api/
│   │   │   │   └── coinApi.ts           # getCoinsMarkets, getMarketChart
│   │   │   ├── model/
│   │   │   │   ├── useCoinsQuery.ts
│   │   │   │   ├── useMarketChartQuery.ts
│   │   │   │   ├── useFavoritesStore.ts # Zustand + persist
│   │   │   │   ├── useFavoritesStore.test.ts
│   │   │   │   └── types.ts             # interface Coin, ChartPoint и т.д.
│   │   │   ├── ui/
│   │   │   │   ├── CoinCard.tsx
│   │   │   │   ├── CoinCard.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts                 # публичный экспорт слайса
│   │   └── currency/
│   │       ├── model/
│   │       │   ├── useCurrencyStore.ts
│   │       │   └── types.ts
│   │       └── index.ts
│   │
│   ├── shared/                        # переиспользуемое, без бизнес-логики
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   │   ├── Card.tsx
│   │   │   │   └── index.ts
│   │   │   └── Loader/
│   │   │       ├── Loader.tsx
│   │   │       └── index.ts
│   │   ├── api/
│   │   │   └── axiosInstance.ts
│   │   ├── lib/
│   │   │   ├── formatPrice.ts
│   │   │   ├── formatPrice.test.ts
│   │   │   └── formatChartData.ts
│   │   └── config/
│   │       └── constants.ts             # список валют, дефолтные монеты, base URL
│   │
│   └── main.tsx                       # точка входа, ReactDOM.createRoot
│
├── .env                                # VITE_COINGECKO_API_KEY (не коммитить)
├── .env.example                        # шаблон переменных без реальных значений (коммитить)
├── .gitignore
├── .dockerignore
├── Dockerfile                          # multi-stage: build → nginx
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
└── README.md
```

## Что лежит в каждом верхнеуровневом слое — коротко

- **app** — склейка всего приложения: провайдеры, роутер, глобальные стили. Ничего бизнесового.
- **pages** — по одной странице на маршрут, собирают виджеты в layout, почти без своей логики.
- **widgets** — самостоятельные крупные блоки интерфейса, которые переиспользуются на нескольких страницах.
- **features** — узкие пользовательские действия (добавить в избранное, сменить валюту).
- **entities** — данные и работа с ними: что такое монета/валюта, как её запросить, как хранить.
- **shared** — кирпичи без знания о бизнесе: кнопки, карточки, axios-инстанс, утилиты форматирования.

Правило импортов одно: **слой видит только то, что ниже него** (`app` может использовать
`pages`, но не наоборот; `entities` не знает о `features`; `shared` не знает вообще ни о чём
бизнесовом).
