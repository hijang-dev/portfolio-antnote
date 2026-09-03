# antnote-backend

API server for **antnote**, a stock-investing app for beginners. Built with
NestJS, TypeORM, and PostgreSQL.

> Setup phase only — this README documents the project skeleton. Feature
> modules (auth, stocks, watchlist, portfolio, etc.) are added incrementally
> under `src/modules/`.

## Tech Stack

| Layer          | Choice                          |
| -------------- | -------------------------------- |
| Language       | TypeScript                       |
| Framework      | NestJS                           |
| ORM            | TypeORM                          |
| Database       | PostgreSQL                       |
| Validation     | class-validator / class-transformer |
| API docs       | Swagger (OpenAPI) via `@nestjs/swagger` |
| Testing        | Vitest                           |

## Project Structure

```
src/
  main.ts                 # bootstrap: helmet, CORS, validation, Swagger
  app.module.ts            # root module wiring
  config/                  # env loading & validation
  database/
    data-source.ts         # DataSource used by the TypeORM CLI
    database.module.ts     # TypeOrmModule.forRootAsync wiring
    migrations/            # generated migration files
  health/                  # GET /health — DB connectivity probe
  common/
    filters/                # global exception filter
  modules/                  # feature modules (added incrementally)
```

## Getting Started

**Prerequisites:** Node 22+, pnpm, Docker (for local PostgreSQL).

```bash
cp .env.example .env        # fill in DB credentials
docker compose up -d        # start local PostgreSQL
pnpm install
pnpm migration:run           # apply schema migrations
pnpm start:dev
```

The API runs on `http://localhost:3000`.

- Swagger docs: `http://localhost:3000/api/docs`
- Health check: `http://localhost:3000/health`

## Database Migrations

Schema changes are managed exclusively through TypeORM migrations —
`synchronize` is disabled everywhere, including local development.

```bash
# after changing/adding an entity
pnpm migration:generate src/database/migrations/<DescriptiveName>

pnpm migration:run
pnpm migration:revert
```

## Scripts

| Command                 | Description                          |
| ------------------------ | ------------------------------------- |
| `pnpm start:dev`         | Start with hot reload                 |
| `pnpm build`              | Compile to `dist/`                    |
| `pnpm start:prod`         | Run the compiled build                |
| `pnpm test` / `test:e2e`  | Unit / e2e tests (Vitest)             |
| `pnpm lint`               | Lint with oxlint                      |
| `pnpm migration:*`        | Generate / run / revert migrations    |

## Environment Variables

See [`.env.example`](./.env.example). Startup fails fast with a clear error
if a required variable is missing (`src/config/env.validation.ts`).

## Reference Docs

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [NestJS + TypeORM Recipe](https://docs.nestjs.com/recipes/sql-typeorm)
