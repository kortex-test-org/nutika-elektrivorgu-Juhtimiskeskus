# Architecture

## Overview

Smart Grid Control Center is a fullstack monorepo application that controls smart home devices based on Nord Pool electricity exchange prices from the Elering API.

## Monorepo Structure

```
apps/
  backend/    — Bun + Elysia REST API + WebSocket server
  frontend/   — Vinext (Next.js App Router on Vite) React 19 UI

packages/
  shared/     — TypeBox schemas, Drizzle schema, DB adapter, types, logger
  config/     — Shared tsconfig.base.json for all apps
```

## Backend Architecture

**Runtime:** Bun with Elysia framework.

```
src/
  index.ts           — App entry, registers all modules, starts cron
  config.ts          — Validates required env vars, exports typed config
  middleware/
    auth.ts          — JWT verification, attaches user to context
    role.ts          — Master-only route guard
  modules/
    auth/            — POST /api/auth/{register,login,logout,me}
    devices/         — CRUD + toggle + override + logs
    notifications/   — GET/PUT /api/notifications/settings
    prices/          — current, forecast, history
    savings/         — savings report + config CRUD
    users/           — master-only user management
  services/
    automation.ts    — Cron: hourly device threshold check
    device-control.ts — HTTP/MQTT command sender with retry
    elering.ts       — Fetches prices from Elering API
    notifications.ts — Telegram/Discord notification sender
    savings.ts       — Savings calculation engine
  ws/
    handler.ts       — Single /ws endpoint, broadcasts events
    manager.ts       — WebSocket connection registry
```

## Frontend Architecture

**Framework:** Vinext (Next.js App Router on Vite), React 19, Tailwind CSS, shadcn/ui.

**Pattern:** Atomic Design — atoms → molecules → organisms → templates → pages.

```
src/
  app/              — App Router pages (layout, login, /, devices, forecast, savings, settings, admin/users)
  components/
    atoms/          — PriceIndicator, StatusBadge
    molecules/      — DeviceCard
    organisms/      — LoginForm, PriceBanner, DeviceGrid, DeviceForm, ForecastChart, SavingsChart
  hooks/            — React Query hooks + useWebSocket
  lib/
    api.ts          — Typed fetch wrapper pointing to NEXT_PUBLIC_API_URL
    queryClient.ts  — React Query client config
  stores/
    authStore.ts    — Zustand: user session
    wsStore.ts      — Zustand: WebSocket state + latest events
```

## Key Design Decisions

### Single shared schema (`packages/shared`)

TypeBox schemas are defined once in `packages/shared/src/validators.ts` and reused on both:
- Backend: Elysia body validation
- Frontend: `react-hook-form` resolver via `@hookform/resolvers/typebox`

TypeScript types are derived via `Static<typeof Schema>` — never written manually.

### PGLite / PostgreSQL adapter

`packages/shared/src/db.ts` exports a single `db` instance. When `DATABASE_URL` is set, it uses `drizzle-orm/node-postgres` (production PostgreSQL). When `DATABASE_URL` is not set, it uses `@electric-sql/pglite` (local development, no Docker required).

### WebSocket event types

| Event | Trigger |
|---|---|
| `price_update` | New price fetched from Elering |
| `device_state_changed` | Any device toggle (auto or manual) |
| `device_disconnected` | Device unreachable after retries |
| `price_threshold_alert` | Price exceeds a device's critical threshold |

### Auth flow

JWT stored as an `auth_token` cookie. The `proxy.ts` (Vinext routing proxy) reads the cookie and redirects unauthenticated requests to `/login`. The backend `auth.ts` middleware verifies the JWT on all protected routes.

### Role model

Two roles: `master` (admin) and `user`. Role checks live exclusively in `middleware/role.ts` — never inside route handlers. The first registered user is automatically assigned `master`.

## Data Flow

```
Elering API → services/elering.ts → DB (prices table)
                                  → WebSocket broadcast (price_update)
                                  → services/automation.ts → devices toggle
                                                           → services/savings.ts
                                                           → services/notifications.ts
```

## Infrastructure

- **Dev:** `bun run dev` (Turbo) — backend on :3001, frontend on :3000, PGLite local DB
- **Prod:** Docker Compose — postgres:5432, backend:3001, frontend:3000
- **Deploy:** GitHub Actions → ghcr.io → Coolify webhook
- **Migrations:** `bun run db:generate` / `bun run db:migrate` (root scripts)
