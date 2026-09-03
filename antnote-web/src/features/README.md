# Feature Modules

Screens/features are added incrementally here, one folder per domain, e.g.:

```
features/
  auth/          # login, signup forms
  stocks/        # stock search, detail, price charts
  watchlist/     # watchlist UI
  portfolio/     # holdings, P&L dashboard
  education/     # beginner glossary / guided content
```

Each feature folder typically contains:

```
<feature>/
  components/      # feature-local UI components
  hooks/            # TanStack Query hooks (useXxxQuery / useXxxMutation)
  store/            # Zustand store, if the feature needs client-only state
  api.ts            # API functions used by the hooks (calls src/lib/api/client.ts)
```

Shared/cross-feature pieces stay in `src/components`, `src/lib`, and
`src/store`. This directory is intentionally empty for now — initial setup
only.
