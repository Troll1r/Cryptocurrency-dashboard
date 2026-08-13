# Crypto Dashboard — план реализации и Gitflow

> Этот документ составлен по `crypto-project-spec.md` и текущему состоянию репозитория
> на 13 августа 2026 года. Его задача — довести проект от Vite-шаблона до готового
> портфолио-проекта последовательными, проверяемыми и удобными для ревью коммитами.

## 1. Результат, который должен быть достигнут

После завершения плана приложение должно быть собранным React + TypeScript сайтом с
FSD-структурой и шестью рабочими маршрутами:

| Маршрут | Готовый результат |
|---|---|
| `/` | обзор рынка, краткие метрики, пять монет и ссылки на основные разделы |
| `/market` | список монет, поиск, сортировка и пагинация/кнопка загрузки следующей страницы |
| `/favorites` | сохранённые в браузере избранные монеты или понятное пустое состояние |
| `/coin/:id` | данные выбранной монеты, избранное, график 24ч/7д/30д и конвертер |
| `/converter` | самостоятельный конвертер с выбором монеты |
| `/about` | статическая страница о проекте, стеке и репозитории |

Во всём приложении действует единая выбранная валюта. Рыночные данные обновляются
polling-ом раз в 60 секунд, избранное и валюта переживают перезагрузку страницы,
а пользователю всегда видны состояния загрузки, ошибки и отсутствия данных. Проект
проходит `lint`, тесты, production-сборку, открывается в Docker и содержит истории
основных визуальных компонентов в Storybook.

## 2. Анализ спецификации: решения, которые надо закрепить до начала кода

Спецификация определяет стек и структуру, но несколько продуктовых деталей оставляет
открытыми. Ниже зафиксирован минимальный, реалистичный вариант. Он не уменьшает
заявленный функционал, зато исключает спорные решения во время разработки.

| Вопрос | Решение для реализации | Причина |
|---|---|---|
| «Полный список всех монет» | Загружать до 100 монет на странице, добавить пагинацию или «Показать ещё». | Эндпоинт CoinGecko отдаёт данные страницами и допускает максимум 250 результатов за запрос; загружать тысячи записей в браузер не нужно. |
| Поиск | Искать без запроса к API среди уже загруженных монет по имени и тикеру; при необходимости пользователь загружает следующую страницу. | Быстрый MVP без отдельного API-поиска, предсказуемый для лимитов. |
| Сортировка | Дать переключатель: market cap (по умолчанию), цена, изменение за 24ч; сортировать текущий загруженный набор на клиенте. | В спецификации сортировка опциональна, но она усиливает страницу рынка без дополнительного сетевого контракта. |
| Данные на главной | Первые 5 монет из ответа рынка, отсортированного по капитализации; метрики — сумма `market_cap` и `total_volume` по загруженному набору с честной подписью «по загруженным монетам». | Эндпоинт из спецификации не даёт глобальные метрики; нельзя выдавать сумму top-100 за весь рынок. |
| Обновление | `useCoinsQuery` получает `refetchInterval: 60_000`; график запрашивается при первом открытии или смене периода и кэшируется, без постоянного polling. | Цены должны обновляться сами, но повторно запрашивать исторический ряд каждую минуту дорого и не даёт заметной пользы. |
| График 24ч | В API `days=1`; вкладки 7д/30д — `days=7`/`days=30`. | Прямое соответствие требованиям и контракту `market_chart`. |
| Конвертер | Пользователь вводит количество криптомонеты; результат = `amount × currentPrice` в глобально выбранной валюте. Сумма пустая/некорректная — вместо ложного нуля показана подсказка. | Соответствует формулировке «сколько выбранная монета стоит». |
| Валюты | Зафиксировать `usd`, `eur`, `rub` в `SUPPORTED_CURRENCIES`; отображаемые названия/символы — USD/$, EUR/€, RUB/₽. | Это покрывает «USD/EUR/RUB и т.д.» в пределах MVP и даёт строго типизированный контракт. Добавление валют позднее — одна правка константы. |
| Избранное | Хранить только массив `coinId`; актуальные карточки получать из уже загруженных рынков, а при прямом заходе на `/favorites` или `/coin/:id` запрашивать недостающие IDs. | В localStorage не дублируются устаревающие цены и изображения. |
| API-ключ | `VITE_COINGECKO_API_KEY` хранится только в локальном `.env`, а `.env.example` содержит пустой шаблон. Ключ передаётся согласно актуальной документации Demo API; при его отсутствии показывается управляемая конфигурационная ошибка. | Любая переменная `VITE_*` в Vite попадёт в клиентскую сборку, поэтому браузерный demo-ключ не может считаться секретом. Реальные закрытые ключи нельзя помещать во frontend. |
| Детали монеты | Для единообразия использовать данные `/coins/markets?ids=:id` для большой цены и карточки; отдельный `/coins/:id` не нужен. | Заявлены только рынок и история; один DTO проще типизировать и тестировать. |
| 404 | Добавить not-found route, хотя он не перечислен среди шести страниц. | Иначе пользователь увидит пустой экран при ошибке в URL. |

### Внешний API и ограничения

Основной запрос рынка — `GET /coins/markets` с `vs_currency`, `page`, `per_page`,
`order=market_cap_desc` и, при необходимости, `ids`. Он возвращает ID, название,
тикер, изображение, цену, капитализацию, объём, ранг и изменение за сутки. История
берётся из `GET /coins/{id}/market_chart` с `vs_currency` и `days`; в ответе
используется массив `prices: [unixMs, price][]`.

Перед фактическим подключением следует сверить в официальной документации CoinGecko
тариф Demo, базовый URL и имя заголовка ключа: эти условия меняются независимо от
кода. В UI нужно обработать как минимум `401/403` (нет или неверен ключ), `429`
(превышен лимит), сеть/offline и пустой массив. Технические детали ответа следует
преобразовать один раз внутри `entities/coin/api`, а не разносить snake_case по UI.

### FSD: обязательные границы

```
app       -> pages, widgets, features, entities, shared
pages     -> widgets, features, entities, shared
widgets   -> features, entities, shared
features  -> entities, shared
entities  -> shared
shared    -> (не импортирует бизнесовые слои)
```

Каждый слайс предоставляет наружу только `index.ts`. Внутренние файлы одного слайса
можно импортировать друг в друга, но внешний потребитель использует public API
слайса. Псевдоним `@/` должен вести на `src`, чтобы импорты показывали слой явно:
`@/entities/coin`, а не цепочки `../../../`.

## 3. Исходная точка и правила работы с Git

Сейчас в ветке `main` есть только Vite React TypeScript template: `App.tsx` выводит
демо Vite, а зависимости из спецификации ещё не установлены. Каталог `md/` не
отслеживается Git, поэтому оба документа в нём нужно включить в первый
документационный коммит. Никакие существующие файлы из `md/` не следует перезаписывать.

Принятый поток:

```text
main ───────────────────────────────────────── release/1.0.0 ──► main (tag v1.0.0)
  \                                                    ▲
   develop ── feature/* ── merge --no-ff ───────────────┘
```

1. `main` всегда содержит выпускаемую версию; работа напрямую в него запрещена.
2. От `main` один раз создаётся и публикуется `develop`.
3. Каждая строка плана ниже — отдельная ветка `feature/*` от актуального `develop`.
4. Каждый feature должен иметь один осмысленный итоговый коммит. Если работа
   занимает долго, допустимы локальные WIP-коммиты, но перед merge они должны быть
   интерактивно объединены или приведены к понятной истории.
5. Feature вливается в `develop` только после выполнения указанной проверки,
   предпочтительно через PR с `--no-ff` merge. Не включать в PR чужие файлы.
6. В конце создаётся `release/1.0.0`; в ней разрешены только исправления,
   документация, версия и release-проверки. После проверки она вливается в
   `main` и обратно в `develop`, затем на `main` ставится тег `v1.0.0`.

Начальная настройка (выполняется один раз):

```bash
git switch main
git pull --ff-only origin main
git switch -c develop
git push -u origin develop
```

Шаблон для любого этапа:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/<name>
# выполнить задачи этапа и проверки
git add <только файлы этапа>
git commit -m "<тип>: <смысл этапа>"
git push -u origin feature/<name>
# открыть PR feature/<name> -> develop, пройти проверку и merge --no-ff
```

Типы Conventional Commits: `docs`, `chore`, `build`, `feat`, `test`, `style`,
`fix`, `refactor`. Сообщение — в повелительном английском времени, например
`feat(market): add searchable paginated coin list`. Путь коммита небольшой:
одна законченная пользовательская или инфраструктурная ценность, без смешивания
рефакторинга «на будущее».

## 4. Поэтапный план реализации

В таблице каждый этап является отдельной feature-веткой и одним итоговым коммитом
в `develop`. Порядок обязателен: нижний слой должен существовать до использования
в верхнем.

### Этап 00 — зафиксировать требования

- Ветка: `feature/project-documentation`
- Коммит: `docs: add project specification and implementation plan`
- Файлы: `md/crypto-project-spec.md`, этот файл, при необходимости кратко
  обновлённый `README.md` со ссылкой на документы.
- Сделать: проверить, что в коммит не попадают `.env`, IDE-файлы или сборка;
  сверить ссылки, названия маршрутов и чек-листы с исходной спецификацией.
- Проверка: `git diff --check`; открыть Markdown preview; `git status --short`
  должен показывать только ожидаемые файлы.
- Готово, когда: требования и план воспроизводимы из репозитория, а не существуют
  только в рабочем окружении.

### Этап 01 — базовая среда, зависимости и конфигурация

- Ветка: `feature/project-foundation`
- Коммит: `chore: configure crypto dashboard foundation`
- Файлы: `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.app.json`,
  `.gitignore`, `.env.example`, `.dockerignore`.
- Сделать:
  1. Использовать именно pnpm (`corepack enable`, если это требуется окружению),
     не создавать `package-lock.json` или `yarn.lock`.
  2. Установить runtime-пакеты: `react-router-dom`, `@tanstack/react-query`,
     `zustand`, `axios`, `recharts`, `tailwindcss`.
  3. Установить dev-пакеты для тестов и историй: `vitest`, `jsdom`,
     `@testing-library/react`, `@testing-library/jest-dom`,
     `@testing-library/user-event`, `storybook`, `@storybook/react-vite`.
     Использовать совместимые на момент установки версии через официальные CLI
     и сохранить получившийся lockfile.
  4. Настроить `@` как alias на `src` одновременно в Vite и TypeScript.
  5. Добавить скрипты `test`, `test:watch`, `test:coverage`, `storybook`,
     `build-storybook`; сохранить текущие `dev`, `build`, `lint`.
  6. В `.env.example` добавить `VITE_COINGECKO_API_KEY=` и, если нужна
     настраиваемость, `VITE_COINGECKO_API_BASE_URL=` с demo URL. В `.gitignore`
     явно добавить `.env` и `.env.*`, оставив исключение для `.env.example`.
  7. В `.dockerignore` исключить `.git`, `node_modules`, `dist`, `.env*` (кроме
     примера), отчёты и Storybook static build.
- Проверка: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`.
- Готово, когда: чистая установка на другой машине воспроизводима, секреты не
  могут попасть в Git, а alias и скрипты работают.

### Этап 02 — FSD-каркас, общие стили и тестовая среда

- Ветка: `feature/app-scaffold`
- Коммит: `chore(app): create FSD scaffold and global styles`
- Файлы: новые каталоги и public API в `src/app`, `src/pages`, `src/widgets`,
  `src/features`, `src/entities`, `src/shared`; `src/index.css`, `src/main.tsx`,
  `src/vite-env.d.ts`; конфигурация Vitest/setup-файл.
- Сделать:
  1. Создать все каталоги из спецификации, в том числе `api`, `model`, `ui`,
     `lib`, `config`; не создавать пустые файлы только для количества — public
     API добавлять вместе с первым модулем слайса.
  2. Подключить Tailwind согласно установленной версии. Для Tailwind 4 это
     `@import "tailwindcss"` в `src/app/styles/index.css`; если выбран Tailwind 3,
     создать `tailwind.config.ts` и `postcss.config.*` с `@tailwind`-директивами.
     Выбрать один вариант, а не смешивать их.
  3. Добавить CSS reset, доступные focus-стили, палитру/типографику, контейнер,
     базовые responsive-breakpoints и `#root { min-height: 100vh; }`. Удалить
     стили и assets Vite-демо только после того, как замена подключена.
  4. Настроить Vitest: environment `jsdom`, setup с `@testing-library/jest-dom`,
     glob для `*.test.ts(x)`, coverage исключает stories и barrel-файлы.
- Проверка: `pnpm test -- --run`, `pnpm lint`, `pnpm build`; открыть пустой
  корень приложения, убедиться, что Vite-экран исчез и консоль чиста.
- Готово, когда: будущие слайсы размещаются в FSD без импорта несуществующих
  уровней, Tailwind работает, а один тестовый smoke-case успешно запускается.

### Этап 03 — shared: конфигурация, HTTP и нейтральный UI

- Ветка: `feature/shared-foundation`
- Коммит: `feat(shared): add API client formatting and base UI`
- Файлы: `src/shared/config/constants.ts`, `src/shared/api/axiosInstance.ts`,
  `src/shared/lib/formatPrice.ts`, `formatChartData.ts`, тест formatter-а,
  `src/shared/ui/{Button,Card,Loader}/**` и их public API.
- Сделать:
  1. В `constants.ts` определить `SUPPORTED_CURRENCIES`, default currency `usd`,
     `POLLING_INTERVAL_MS = 60_000`, `MARKET_PAGE_SIZE = 100`, доступные
     периоды графика и API base URL. Тип валюты вывести из `as const`.
  2. Создать единый axios instance с `baseURL`, `timeout`, заголовком demo-ключа
     только если ключ есть, и нормализацией ошибок в понятное `ApiError`.
     Не записывать ключ в логи и не добавлять interceptor с бесконечным retry.
  3. `formatPrice` должен корректно обрабатывать `null`, `undefined`, `NaN`,
     маленькие цены и локаль/валюту через `Intl.NumberFormat`; добавить
     `formatCompactNumber`, если он действительно используется для метрик.
  4. `formatChartData` преобразует `[timestamp, price]` в объект для Recharts
     (`timestamp`, `date`, `price`) и не мутирует входные данные.
  5. Компоненты `Button`, `Card`, `Loader` не знают о coin/currency; у кнопки
     есть `type`, `disabled`, вариант оформления и корректный `focus-visible`.
- Проверка: unit-тесты форматирования (USD/RUB, null, дробная цена, timestamp);
  `pnpm test -- --run`, `pnpm lint`, `pnpm build`.
- Готово, когда: API-детали и повторяющийся дизайн не размазаны по страницам.

### Этап 04 — entities: типы, локальное состояние и запросы CoinGecko

- Ветка: `feature/coin-data-layer`
- Коммит: `feat(coin): add market data queries and persisted stores`
- Файлы: `src/entities/coin/{api,model,ui/index.ts,index.ts}`,
  `src/entities/currency/{model,index.ts}`, тесты stores; `src/app/providers/QueryProvider.tsx`.
- Сделать:
  1. Описать API DTO отдельно от доменных типов: `Coin`, `CoinMarketResponse`,
     `ChartPoint`, `MarketChartResponse`, `ChartPeriod`. Поля, которые API
     может вернуть `null`, должны иметь это в TypeScript.
  2. Реализовать `getCoinsMarkets({ currency, page, ids? })` и
     `getMarketChart({ id, currency, days })`. Передавать query params через
     axios `params`; `ids` — только через `join(',')`; не строить URL строкой.
  3. В `useCoinsQuery` включить валюту, страницу и IDs в `queryKey`; для общего
     списка включить polling 60 секунд, для точечной загрузки IDs — отключить
     polling. Установить разумные `staleTime`, `retry` и не refetch-ить скрытую
     вкладку без необходимости.
  4. В `useMarketChartQuery` ключ включает coin ID, валюту и период; график
     включён только при валидном ID и получает подходящий `days`.
  5. `useFavoritesStore`: Zustand `persist`, ключ например
     `crypto-dashboard-favorites`, уникальный `string[]`, методы `toggle`,
     `isFavorite`, `clear`; обеспечить безопасную гидратацию в браузере.
  6. `useCurrencyStore`: persist с ключом `crypto-dashboard-currency`, строго
     типизированный `setCurrency`; никакой серверной цены в Zustand.
  7. `QueryProvider` создаёт один `QueryClient` на жизненный цикл приложения.
- Проверка: тесты add/remove/no-duplicate/re-hydration избранного и смены
  валюты; мок axios/MSW или `vi.mock` для hook-ов; `pnpm test -- --run`.
- Готово, когда: состояние разделено на server state (React Query) и browser
  state (Zustand), а переход между валютами гарантированно создаёт новый ключ кэша.

### Этап 05 — app: роутер, layout, навигация и глобальная валюта

- Ветка: `feature/app-navigation`
- Коммит: `feat(app): add routed layout and currency switcher`
- Файлы: `src/app/router/**`, `src/app/App.tsx`, `src/app/providers/index.ts`,
  `src/widgets/site-header/**`, `src/features/switch-currency/**`, временные
  page-компоненты по всем маршрутам.
- Сделать:
  1. Создать Browser Router с layout route и дочерними маршрутами для всех шести
     путей; добавить `*` → not-found. Каждый page пока может показать заголовок,
     но маршрут обязан быть реальным.
  2. `App` соединяет `QueryProvider` и `RouterProvider`; `main.tsx` содержит
     только React root и глобальный stylesheet.
  3. `Layout` содержит логотип-ссылку на `/`, semantic `<header>`, `<nav>`,
     `NavLink` с активным стилем, currency switcher и `<main><Outlet /></main>`.
  4. Currency switcher — доступный `<label><select>` либо кнопка с полноценной
     keyboard-навигацией; изменение обновляет Zustand и через queryKey все цены.
  5. На узкой ширине навигация не должна ломать header: перенести ссылки или
     допустить горизонтальный scroll с понятным фокусом.
- Проверка: вручную пройти все URL, back/forward и прямую загрузку `/coin/bitcoin`;
  проверить активный NavLink и смену currency в devtools localStorage;
  `pnpm lint && pnpm build`.
- Готово, когда: приложение больше не одноэкранное и любой новый экран получает
  общую навигацию и валюту.

### Этап 06 — entity UI: карточка монеты и действие «избранное»

- Ветка: `feature/coin-card-favorites`
- Коммит: `feat(coin): add reusable coin card and favorites action`
- Файлы: `src/entities/coin/ui/CoinCard.tsx`,
  `src/features/add-to-favorites/**`, тесты и exports.
- Сделать:
  1. `CoinCard` показывает rank, изображение с осмысленным alt, name, uppercase
     symbol, price, 24h change и market cap; состояние отсутствующих/null-данных
     не ломает разметку.
  2. Название/карточка ведут на `/coin/:id` через `<Link>`, а не через `window`.
  3. `AddToFavoritesButton` получает `coinId` и имя, сам читает store, даёт
     `aria-pressed`, информативный `aria-label`, toggle и не инициирует переход
     к карточке при click (`stopPropagation` только если это действительно
     вложенный интерактивный элемент; лучше не делать кнопку внутри ссылки).
  4. Цвет изменения за 24ч не единственный сигнал: рядом есть `+`/`−` и текст.
- Проверка: React Testing Library — initial state, add/remove, доступное имя,
  переход по отдельной ссылке; `pnpm test -- --run`.
- Готово, когда: одна карточка и одна кнопка переиспользуются в списках, home и
  details, без копирования бизнес-логики.

### Этап 07 — widget CoinList: данные, состояния, поиск и сортировка

- Ветка: `feature/market-list`
- Коммит: `feat(market): add searchable paginated coin list`
- Файлы: `src/widgets/coin-list/**`, при необходимости маленькие shared UI
  controls и тест widget-а.
- Сделать:
  1. `CoinList` получает coins и не знает, откуда они загрузились. Поддерживает
     вариант compact (5 карточек) и full, slot/prop для заголовка, loading,
     error и empty states.
  2. На полной версии добавить controlled search, case-insensitive match name/
     symbol, сброс page при новой загрузке, dropdown сортировки и stable sort.
  3. На странице рынка запросить page 1, показать понятную кнопку «Показать ещё»;
     подключить следующую страницу через `useInfiniteQuery` либо хранение page в
     URL/search params. Выбрать один вариант и покрыть loading next page.
  4. Не путать «результатов нет по поиску» с сетевой ошибкой и пустым ответом API.
- Проверка: widget tests для поиска, сортировки, no-results и disabled button;
  вручную проверить 100+ элементов, изображение без layout shift и мобильный вид.
- Готово, когда: список может быть единым блоком на `/`, `/market` и `/favorites`.

### Этап 08 — страницы Home и Market

- Ветка: `feature/home-and-market-pages`
- Коммит: `feat(pages): implement market overview and market page`
- Файлы: `src/pages/home/**`, `src/pages/market/**`; если нужно, только
  специфичные page-level presentational blocks.
- Сделать:
  1. `HomePage`: hero с понятным назначением сайта, компактные метрики с честной
     подписью данных, первые 5 CoinCard, ссылки «Смотреть рынок» и «Конвертер».
  2. `MarketPage`: заголовок, объяснение последнего обновления, полный CoinList,
     поиск/сортировка/пагинация из этапа 07.
  3. На обоих экранах переиспользовать `useCoinsQuery`, а не делать два разных
     сетевых механизма. Loading — skeleton или Loader, ошибка — alert и кнопка
     retry (`refetch`).
  4. Показать человеку время последнего успешного обновления, а не утверждать
     «real-time» без объяснения; после 60 секунд данные реально обновляются.
- Проверка: сменить USD/EUR/RUB и убедиться, что все значения в обоих экранах
  обновляются; отключить сеть и проверить retry; `pnpm lint`, тесты, build.
- Готово, когда: два главных информационных маршрута полностью рабочие с API.

### Этап 09 — страница избранного

- Ветка: `feature/favorites-page`
- Коммит: `feat(favorites): add persisted favorites page`
- Файлы: `src/pages/favorites/**`, возможно адаптация query/entity API для IDs.
- Сделать:
  1. Прочитать список IDs из Zustand. При пустом массиве показать объяснение,
     кнопку на `/market` и не делать бессмысленный HTTP-запрос.
  2. При непустом списке запросить текущие данные избранных (с batching IDs до
     лимита API), показать CoinList и действие удаления на карточках.
  3. Учесть монету, которую API больше не возвращает: не скрывать проблему молча,
     показать id/мягкое уведомление и возможность удалить его из избранного.
  4. Проверить сохранение: добавить на market → refresh → открыть favorites;
     удалить → refresh → список пуст.
- Проверка: tests пустого/заполненного состояния и persisted store; ручной flow
  из четырёх действий выше; `pnpm test -- --run`.
- Готово, когда: набор избранного не теряется и отображает не закэшированные цены,
  а текущие данные в выбранной валюте.

### Этап 10 — PriceChart и детали монеты

- Ветка: `feature/coin-details-chart`
- Коммит: `feat(coin-details): add price history and coin details`
- Файлы: `src/widgets/price-chart/**`, `src/pages/coin-details/**`, возможно
  обновлённые coin-query types/tests.
- Сделать:
  1. `PriceChart` принимает отформатированные точки, currency, active period и
     callback; сам содержит доступный tablist/группу кнопок 24ч/7д/30д,
     responsive Recharts `ResponsiveContainer`, tooltip с точной датой и ценой.
  2. `CoinDetailsPage` читает `id` через `useParams`, валидирует его (не
     допускает undefined), получает market data по ID, показывает крупную цену,
     24h change, CoinCard/краткие показатели, favorites button, PriceChart и
     CurrencyConverter (после следующего этапа допустим временный slot).
  3. Период должен переключать `queryKey`; отрисовка старого графика во время
     обновления должна быть обозначена loading-индикатором, а не выглядеть как
     новые данные.
  4. Если ID не существует, показать not-found state и ссылку к рынку; если
     график не загрузился, не скрывать цену и дать retry именно графика.
- Проверка: unit test period selector/query args и empty graph; проверить URL
  `/coin/bitcoin`, `/coin/ethereum`, несуществующий ID и смену валюты; проверить
  chart на 320px и desktop.
- Готово, когда: детальный маршрут полностью предоставляет данные и историческую
  динамику без дублирования API-вызовов.

### Этап 11 — CurrencyConverter и отдельная страница

- Ветка: `feature/currency-converter`
- Коммит: `feat(converter): add reusable cryptocurrency converter`
- Файлы: `src/widgets/currency-converter/**`, `src/pages/converter/**`,
  интеграция в `CoinDetailsPage`.
- Сделать:
  1. Widget получает fixed `coinId` для details или позволяет выбрать монету
     (combobox/select) в самостоятельной странице. Список выбора использует
     доступные загруженные coins; понятный placeholder объясняет ограничение.
  2. Поле amount — `inputMode="decimal"`, полноценный label, допускает точку
     и запятую, не принимает отрицательные/Infinity/NaN, не форматирует value
     так, чтобы пользователь не мог продолжать ввод.
  3. Результат считает `amount * currentPrice` в глобальной валюте. Цена должна
     идти из React Query по выбранной монете и выбранной currency; явно показать
     loading/error/no-price, название монеты и валюту результата.
  4. При изменении валюты price и результат обновляются автоматически;
     выбранная монета не должна самопроизвольно сбрасываться.
- Проверка: tests нормального расчёта, `0`, `1.5`, запятой, пустого/отрицательного
  значения, смены монеты и валюты; ручная проверка на details и `/converter`.
- Готово, когда: один widget обслуживает оба сценария без двух разных формул.

### Этап 12 — статические страницы, 404 и доступность

- Ветка: `feature/information-pages`
- Коммит: `feat(pages): add about and not-found screens`
- Файлы: `src/pages/about/**`, `src/pages/not-found/**` (дополнение к исходной
  структуре), router, при необходимости `README` placeholder для URL GitHub.
- Сделать:
  1. About: цель pet-проекта, стек, архитектура, источник данных, условие
     polling и корректная ссылка на фактический репозиторий. До появления URL
     не ставить вымышленную внешнюю ссылку — оставить TODO в README/конфиге.
  2. NotFound: HTTP-подобный 404 текст, ссылка на главную и рынок.
  3. Пройти keyboard-only сценарий: skip link при необходимости, видимый focus,
     заголовки в правильном порядке, labels у inputs, aria-live для обновлений/
     ошибок, контраст цветов и alt у иконок/изображений.
  4. Проверить responsive layout 320px, 768px и desktop: header, таблица/карточки,
     график, converter; horizontal scroll допустим только там, где он очевиден.
- Проверка: keyboard walkthrough; Lighthouse accessibility как ориентир (не
  подменяет ручную проверку); `pnpm lint && pnpm build`.
- Готово, когда: все маршруты из спецификации, а также ошибочный URL, имеют
  законченное и доступное представление.

### Этап 13 — unit/component tests и покрытие критической логики

- Ветка: `feature/test-coverage`
- Коммит: `test: cover dashboard critical user flows`
- Файлы: все недостающие `*.test.ts(x)`, test helpers/mocks, Vitest config.
- Сделать:
  1. Сохранить тесты из этапов 03, 04, 06, 07, 09, 10, 11; в этом этапе закрыть
     отсутствующие критические ветви, а не переписать работающие тесты.
  2. Минимальная матрица: `formatPrice`; `formatChartData`; favorites store;
     currency store; CoinCard; add/remove favorites; CoinList search/sort/empty;
     PriceChart tabs; CurrencyConverter validation/calculation; одна страница
     в loading/error/success состоянии.
  3. В тестах изолировать network (MSW или `vi.mock`); не обращаться в живой
     CoinGecko и не читать фактический localStorage между test cases.
  4. Установить достижимый coverage threshold только для `shared/lib`, stores
     и features (например, 80% statements/branches), не гнаться за формальными
     100% UI-строк без смысла.
- Проверка: `pnpm test -- --run`, `pnpm test:coverage`, `pnpm lint`, `pnpm build`.
- Готово, когда: важная логика ловит регрессии без API-ключа и нестабильной сети.

### Этап 14 — Storybook для ключевого UI

- Ветка: `feature/component-stories`
- Коммит: `docs(storybook): document reusable dashboard UI`
- Файлы: `.storybook/main.ts`, `.storybook/preview.ts`, stories из спецификации
  для `Button`, `CoinCard`, `Layout`, `PriceChart`, возможно converter.
- Сделать:
  1. Инициализировать Storybook его Vite-совместимым CLI, сохранить созданные
     конфиги и подключить глобальные Tailwind styles из `preview`.
  2. Button: default/secondary/disabled/loading (если есть); CoinCard: рост,
     падение, отсутствующая цена; PriceChart: все периоды, empty; Layout:
     active route/узкая ширина через decorators.
  3. Для компонентов со store/router/query использовать decorators с test
     QueryClient, MemoryRouter и предсказуемым mock-state. Stories не должны
     обращаться к живому API или требовать `.env`.
  4. Проверить доступность в Storybook, если выбран addon a11y, и не включать
     аддон только ради конфигурации без просмотра результатов.
- Проверка: `pnpm storybook` — истории открываются без console errors;
  `pnpm build-storybook` завершается успешно.
- Готово, когда: основные UI-блоки можно показать на защите и менять изолированно.

### Этап 15 — Docker и production-раздача SPA

- Ветка: `feature/docker-production`
- Коммит: `build: add production Docker image`
- Файлы: `Dockerfile`, `.dockerignore`, nginx-конфигурация (например,
  `nginx/default.conf`) и README-инструкция запуска.
- Сделать:
  1. Multi-stage Dockerfile: в builder использовать закреплённый Node LTS,
     сначала копировать `package.json` и `pnpm-lock.yaml`, включить corepack,
     выполнить `pnpm install --frozen-lockfile`, затем скопировать исходники и
     выполнить `pnpm build`.
  2. В final image использовать nginx alpine, копировать только `dist`,
     запускать непривилегированным пользователем там, где образ это позволяет.
  3. Nginx `try_files $uri $uri/ /index.html;` обязателен: иначе прямой переход
     на `/coin/bitcoin` вернёт 404. Добавить cache headers для статических assets
     и не кешировать `index.html` слишком агрессивно.
  4. Описать `docker build -t crypto-dashboard .` и `docker run --rm -p 8080:80
     crypto-dashboard`. Важно: Vite-переменные подставляются во время build;
     ключ передаётся build arg/CI secret осознанно и не копируется `.env` в image.
- Проверка: собрать чистый image; открыть `/`, `/market`, и прямой
  `http://localhost:8080/coin/bitcoin`; проверить, что image не содержит
  `node_modules`, `.git` или `.env`.
- Готово, когда: production SPA можно поднять одной документированной командой.

### Этап 16 — README, финальная проверка и подготовка release

- Ветка: `feature/release-documentation`
- Коммит: `docs: finalize setup and project documentation`
- Файлы: `README.md`, возможно `.env.example` и только исправления документации.
- Сделать:
  1. Заменить стандартный Vite README: описание, скриншот/демо при наличии,
     стек, FSD-карта, перечисление маршрутов, получение CoinGecko Demo key,
     настройка `.env`, команды pnpm/test/storybook/docker, известные ограничения
     (rate limits, top-100 + pagination) и Gitflow.
  2. Указать реальные требования Node/pnpm на основе lockfile/CI, но не
     придумывать URL деплоя, badge или GitHub username.
  3. Удалить оставшиеся Vite demo assets, мёртвый `App.css`, неиспользуемые
     зависимости и console.log. Это допустимо здесь только как hygiene перед
     выпуском; функциональные изменения вернуть в отдельный feature/fix.
  4. Пройти приемочный список ниже на чистой установке с реальным demo key.
- Проверка: `pnpm install --frozen-lockfile && pnpm lint && pnpm test -- --run
  && pnpm build && pnpm build-storybook`; `git diff --check`; проверить
  `git status` и отсутствие ключа в `git grep -n` по отслеживаемым файлам.
- Готово, когда: новый разработчик может запустить, проверить и объяснить проект
  только по README.

## 5. Release 1.0.0

Это не feature-ветка. После merge этапа 16 в `develop`:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c release/1.0.0
# только release-fixes и документация, если они появились
git push -u origin release/1.0.0
```

На release-ветке нельзя добавлять функции или менять архитектуру. Обязательно
провести полный набор команд из этапа 16, ручной проход всех путей в браузере,
проверку Docker и прямой переход на вложенный route. Если найден дефект, исправить
его отдельным коммитом вида `fix(release): handle <problem>` и снова прогнать весь
набор.

Когда release принята:

```bash
# через PR release/1.0.0 -> main, затем
git switch main
git pull --ff-only origin main
git tag -a v1.0.0 -m "Crypto Dashboard v1.0.0"
git push origin main --follow-tags
# затем отдельный PR release/1.0.0 -> develop, чтобы release-fix не потерялся
```

После merge обратно в `develop` ветку `release/1.0.0` можно удалить только когда
оба PR влиты и тег виден на `main`. Feature-ветки удаляются после merge PR, локально
и на origin, если этого требует политика репозитория.

## 6. Финальный приемочный чек-лист

### Функциональность

- [ ] Все шесть требуемых URL и 404 открываются напрямую и через навигацию.
- [ ] Header содержит активные ссылки и глобальный переключатель USD/EUR/RUB.
- [ ] После смены валюты меняются цена, market cap, объём, график и converter;
  избранное не теряется.
- [ ] Рынок показывает данные API, поиск по name/symbol, сортировку и следующую
  страницу; нет зависшего loader-а при ошибке или пустом поиске.
- [ ] Главная показывает 5 монет, метрики с корректной подписью и рабочие CTA.
- [ ] Polling действительно обновляет общий список раз в 60 секунд без ручного
  refresh и не делает polling исторического графика.
- [ ] Toggle избранного работает из списка и деталей, переживает reload, а
  `/favorites` имеет empty/error/success states.
- [ ] `/coin/:id` показывает цену, 24h change, избранное и график 24ч/7д/30д;
  несуществующий ID и ошибка истории обработаны отдельно.
- [ ] Converter валидирует ввод и верно пересчитывает результат в текущей валюте
  и на странице детали, и на отдельной странице.

### Качество и безопасность

- [ ] Входящие API данные типизированы, `null` и network/API errors безопасны.
- [ ] `VITE_COINGECKO_API_KEY` есть лишь в локальном `.env`; в репозиторий
  добавлен только `.env.example`; ключ не попадал в commits, images и README.
- [ ] FSD-импорты направлены только вниз, потребители используют public API.
- [ ] Нет Vite demo UI/assets/мёртвого CSS и нет предупреждений в console.
- [ ] Поля имеют labels, кнопки имеют accessible names, focus заметен, интерфейс
  usable клавиатурой и на мобильной ширине.
- [ ] `pnpm lint`, `pnpm test -- --run`, `pnpm test:coverage`, `pnpm build` и
  `pnpm build-storybook` зелёные с чистой установки.
- [ ] Docker image запускает production build, а Nginx отдаёт `index.html` для
  React Router URL.

### История Git

- [ ] В `main` нет прямых feature-коммитов: есть merge release и тег `v1.0.0`.
- [ ] Каждая feature-ветка ответвлялась от `develop`, имеет понятный PR и
  проверку, соответствующую этапу.
- [ ] `develop` содержит все исправления из release.
- [ ] В истории нет `.env`, `node_modules`, `dist`, секретов или случайных
  изменений IDE.

## 7. Реалистичный график на четыре дня

| День | Этапы | Контрольная точка |
|---|---|---|
| 1 | 00–05 | Репозиторий и FSD готовы; API-запросы, stores, router и header работают. |
| 2 | 06–09 | Есть цельный рынок, home и сохранённое избранное. |
| 3 | 10–12 | График, детали, converter, about/404 и адаптивность закончены. |
| 4 | 13–16 + release | Тесты, Storybook, Docker, README, smoke/release и тег. |

Если времени не хватает, не сокращать обработку ошибок, env и build-проверки.
Первое, что допускается перенести после MVP — клиентская сортировка, расширенный
набор валют и дополнительная визуальная полировка. Все шесть страниц, выбранная
валюта, избранное, график, converter, тесты базовой логики и Docker остаются
необходимой частью готового проекта.
