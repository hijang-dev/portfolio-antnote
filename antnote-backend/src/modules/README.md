# Feature Modules

Domain feature modules live here, one folder per bounded context, e.g.:

```
modules/
  auth/          # signup, login, JWT issuance
  users/         # user profile, settings
  stocks/        # stock master data, price lookups
  watchlist/     # per-user watchlists
  portfolio/     # holdings, average price, P&L
  education/     # beginner glossary / guided content
```

Each module should follow the standard Nest layout:

```
<module>/
  <module>.module.ts
  <module>.controller.ts
  <module>.service.ts
  entities/
    <name>.entity.ts
  dto/
    create-<name>.dto.ts
    update-<name>.dto.ts
```

This directory is intentionally empty for now — initial setup only. Feature
modules are added incrementally as each feature is implemented.
