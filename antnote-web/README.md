# antnote-web

Web client for **antnote**, a stock-investing app for beginners. Built with
Next.js (App Router), Zustand, and TanStack Query.

> Setup phase only — this README documents the project skeleton. Feature
> screens (auth, stocks, watchlist, portfolio, etc.) are added incrementally
> under `src/features/`.

## Tech Stack

| Concern                       | Choice                          |
| ------------------------------ | -------------------------------- |
| Language                       | TypeScript                       |
| Framework                      | Next.js (App Router)             |
| Styling                        | Tailwind CSS                     |
| Client / UI state               | Zustand                          |
| Server data / async state       | TanStack Query (React Query)     |

## Project Structure

```
src/
  app/
    layout.tsx        # root layout, wraps app in Providers
    providers.tsx      # QueryClientProvider setup
    page.tsx            # home page
  components/           # shared/cross-feature UI components
  features/              # feature modules (added incrementally)
  lib/
    api/
      client.ts          # fetch wrapper (base URL, error shape)
      health.ts           # example query function
    query/
      get-query-client.ts # SSR-safe QueryClient factory
  store/
    useUiStore.ts         # example Zustand store
```

## Getting Started

**Prerequisites:** Node 22+, pnpm, and `antnote-backend` running locally.

```bash
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Runs on `http://localhost:3001` (3000 is reserved for the backend). The home
page calls the backend's `/health` endpoint via TanStack Query and toggles a
Zustand store value, to confirm the setup is wired correctly end to end.

## State Management Convention

- **Zustand** — client-only UI state (modals, toggles, wizard steps, local
  drafts). Stores live in `src/store/` (shared) or `<feature>/store/`
  (feature-local).
- **TanStack Query** — anything that comes from the API (stock data, user
  portfolio, auth session). Query/mutation hooks live next to the feature
  that owns them, backed by functions in `src/lib/api/`.

## Scripts

| Command      | Description                  |
| ------------- | ------------------------------ |
| `pnpm dev`    | Start dev server on port 3001 |
| `pnpm build`  | Production build               |
| `pnpm start`  | Run the production build       |
| `pnpm lint`   | Lint with ESLint               |

## Reference Docs

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query — Next.js SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [Zustand Documentation](https://zustand.docs.pmnd.rs)
