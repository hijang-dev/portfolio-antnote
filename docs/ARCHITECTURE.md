# Architecture

## Overview

```
┌─────────────────┐        HTTPS / JSON        ┌──────────────────┐        SQL        ┌──────────────┐
│   antnote-web     │  ────────────────────────▶ │  antnote-backend   │ ─────────────────▶ │  PostgreSQL    │
│   Next.js client   │ ◀──────────────────────── │  NestJS API server  │ ◀───────────────── │                │
└─────────────────┘                              └──────────────────┘                    └──────────────┘
      Zustand                                      TypeORM (migrations,
   (client/UI state)                                 no auto-sync)
   TanStack Query
  (server-state cache)
```

- The web client never talks to PostgreSQL directly — all data access goes
  through the NestJS API.
- **Zustand** owns client-only UI state (toggles, wizard steps, drafts).
  **TanStack Query** owns anything that came from the API, including its
  cache, loading/error states, and refetching. This split keeps "did the
  user click something" and "what does the server say" from tangling
  together in one store.
- Schema changes go through TypeORM migrations only — `synchronize` is
  disabled in every environment, including local dev, so what runs in
  production is exactly what was reviewed in a migration file.

## Backend Module Layout

```
config/      → env loading + fail-fast validation on boot
database/    → TypeOrmModule wiring, CLI DataSource, migrations
health/      → GET /health (DB connectivity probe for ALB/ECS/local docker)
common/      → cross-cutting concerns (global exception filter, etc.)
modules/     → feature modules (auth, stocks, watchlist, portfolio, ...)
```

Each feature module is self-contained (controller, service, entities, DTOs),
so features can be built and reviewed independently once the setup phase is
done.

## Planned AWS Deployment

Not provisioned yet — this is the target shape once features are ready to
ship, kept here so infra decisions aren't made ad hoc later.

| Component        | Service                                  |
| ------------------ | ------------------------------------------ |
| Web                | Amplify Hosting or S3 + CloudFront          |
| API                 | ECS Fargate (containerized NestJS) behind an ALB |
| Database            | RDS for PostgreSQL                          |
| Migrations           | run as a one-off ECS task on deploy         |
| Secrets              | AWS Secrets Manager → injected as env vars    |
| CI/CD                | GitHub Actions → build image → push to ECR → deploy |

`GET /health` exists specifically so the ALB target group and ECS task
definition have something real to probe (checks the DB connection, not just
"process is alive").

## Key Decisions

| Decision                                   | Why |
| -------------------------------------------- | ----- |
| Migrations only, no `synchronize`             | Predictable, reviewable schema changes; safe in production |
| Env validation on boot                         | Fail fast with a clear message instead of an opaque DB connection error |
| Zustand + TanStack Query split                  | Avoids server data and UI state fighting over the same store |
| NestJS over Express                              | Built-in DI/module structure scales better as feature modules are added |
