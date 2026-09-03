# antnote

A stock-investing app aimed at beginners — helping first-time investors
understand what they're buying before they buy it (plain-language stock
info, watchlists, portfolio tracking, and beginner-oriented education).

> **Status:** initial project setup. Backend and frontend skeletons are
> wired end to end (DB, API, client state, server-state fetching); feature
> screens are being added incrementally.

## Why this project

Built as a portfolio project to demonstrate a full-stack TypeScript setup:
a typed API with a real relational schema, a modern React data layer, and
the kind of setup decisions (migrations over auto-sync, env validation,
CORS/security headers, health checks) that matter once an app leaves
"toy project" territory.

## Tech Stack

|            | Choice                                          |
| ---------- | ------------------------------------------------ |
| Language   | TypeScript                                        |
| Web        | Next.js (App Router), Tailwind CSS                |
| Client state | Zustand                                         |
| Server state | TanStack Query (React Query)                    |
| Backend    | NestJS                                            |
| ORM        | TypeORM                                           |
| Database   | PostgreSQL                                        |
| Infra      | AWS                                               |

## Repository Structure

```
antnote-web/       # Next.js client        → antnote-web/README.md
antnote-backend/    # NestJS API server     → antnote-backend/README.md
docs/                # architecture notes
```

## Getting Started

Each app has its own setup instructions:

- [`antnote-backend/README.md`](./antnote-backend/README.md) — API server, PostgreSQL via Docker, migrations
- [`antnote-web/README.md`](./antnote-web/README.md) — Next.js client

Quick start (backend first, then web):

```bash
# 1. backend
cd antnote-backend
cp .env.example .env
docker compose up -d
pnpm install && pnpm migration:run && pnpm start:dev   # http://localhost:3000

# 2. web (in a new terminal)
cd antnote-web
cp .env.local.example .env.local
pnpm install && pnpm dev                                 # http://localhost:3001
```

## Docs

- [Architecture](./docs/ARCHITECTURE.md)
