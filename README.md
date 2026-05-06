# Nutika Elektrivõrgu Juhtimiskeskus

A smart grid control center for managing home devices based on Nord Pool electricity exchange prices from the [Elering API](https://dashboard.elering.ee/api).

## Features

- Real-time electricity price monitoring (Elering API)
- Automatic device on/off based on price thresholds
- Manual device control with override mode
- 24h price forecast chart
- Savings calculator (exchange vs fixed tariff)
- Telegram / Discord notifications for price alerts
- WebSocket live updates for all events
- Master + user role model
- Works fully offline with PGLite (no Docker needed for local dev)

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vinext (Next.js App Router on Vite), React 19, Tailwind CSS, shadcn/ui |
| State | Zustand (client) + React Query (server cache) |
| Backend | Bun + Elysia |
| Auth | JWT + Argon2 |
| Validation | TypeBox (shared schemas, used on both ends) |
| ORM | DrizzleORM |
| DB (dev) | PGLite (auto, no setup) |
| DB (prod) | PostgreSQL |
| Monorepo | Turborepo + Bun workspaces |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.3

## Local Development

```sh
# 1. Clone
git clone https://github.com/your-org/smartgrid
cd smartgrid

# 2. Install dependencies
bun install

# 3. Copy environment file
cp .env.example .env
# Edit .env and set JWT_SECRET (minimum)

# 4. Start dev servers
bun run dev
# → Backend:  http://localhost:3001
# → Frontend: http://localhost:3000
# → Swagger:  http://localhost:3001/docs
```

PGLite is used automatically when `DATABASE_URL` is not set — no database setup required.

## Production (Docker Compose)

```sh
# Set required secrets
export JWT_SECRET=your-secret-here
export POSTGRES_PASSWORD=your-db-password

# Build and start
docker compose up -d
```

## Database Migrations

```sh
# Generate migration (local PGLite)
bun run db:generate

# Apply migration (local PGLite)
bun run db:migrate

# For production PostgreSQL (set DATABASE_URL first)
bun run db:generate:prod
bun run db:migrate:prod
```

## Project Structure

```
apps/
  backend/    — Bun + Elysia REST API + WebSocket
  frontend/   — Vinext Next.js App Router frontend
packages/
  shared/     — TypeBox schemas, Drizzle schema, DB adapter, logger
  config/     — Shared tsconfig.base.json
docs/
  architecture.md  — System design and key decisions
  api.md           — API endpoint reference
  state.md         — Frontend state management map
  TODO.md          — Development progress tracker
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [State Management](docs/state.md)
