
# Project: Nutika Elektrivõrgu Juhtimiskeskus (Smart Grid Control Center)

## Description

A fullstack web application — a control center for managing smart devices based on Nord Pool electricity exchange prices fetched from the Elering API. This is a student diploma project that must strictly conform to its technical specification.

## Stack

- **Package manager:** Bun (not npm, not pnpm)
- **Language:** TypeScript everywhere, strict mode
- **Linter/Formatter:** Biome
- **Tests:** Vitest
- **Frontend:** Vinext (Vite-based Next.js reimplementation) — App Router, deployed as a Node.js/Bun HTTP server in Docker
- **UI:** React 19 + Tailwind CSS + shadcn/ui
- **State:** Zustand (client) + React Query (server state / cache)
- **Real-time:** WebSocket (native browser API with exponential backoff reconnect)
- **Forms:** react-hook-form + `@hookform/resolvers/typebox`
- **Backend:** Bun runtime + Elysia framework
- **Auth:** JWT (`@elysiajs/jwt`) + argon2 for password hashing
- **Validation:** TypeBox (`@sinclair/typebox`) — shared schemas in `packages/shared`, used in Elysia body validation and react-hook-form resolver
- **ORM:** DrizzleORM
- **Database (prod):** PostgreSQL (`DATABASE_URL` env)
- **Database (local dev):** PGLite (`@electric-sql/pglite`) — auto-selected when `DATABASE_URL` is not set
- **Cron:** node-cron or built-in Bun scheduler for periodic price fetching
- **Infra:** Coolify + Docker, GitHub Actions CI/CD, Grafana + Loki (later)

## Architecture

- **Monorepo:** Bun workspaces
  ```
  apps/
    frontend/   — Vinext (Next.js App Router)
    backend/    — Bun + Elysia
  packages/
    shared/     — TypeScript types + Drizzle schema + TypeBox schemas
  ```
- **Frontend pattern:** Atomic Design (atoms → molecules → organisms → templates → pages)
- **Monorepo applyTo paths:** frontend rules apply to `apps/frontend/**`, backend rules to `apps/backend/**`

## Custom conventions

- TypeBox schemas are defined **once** in `packages/shared/src/validators.ts` and reused on both backend (Elysia body validation) and frontend (react-hook-form resolver) — never duplicate schemas
- `Static<typeof Schema>` always used to derive TypeScript types from schemas — never written manually
- PGLite / PostgreSQL adapter pattern is mandatory — see `packages/shared/src/db.ts`
- All logs must be structured JSON from day one (for Grafana/Loki integration)
- UUIDs via `.defaultRandom()` in Drizzle or `crypto.randomUUID()` in app code — never `gen_random_uuid()` in raw SQL (PGLite incompatibility)
- Backend never returns stack traces to clients — only `{ error: string }` with human-readable messages
- Role checks are in middleware only, never inside route handlers
- Auto-commit is enabled: one local commit per completed TODO step (no push)

Detailed coding rules are split into instruction files in `.github/instructions/`.
