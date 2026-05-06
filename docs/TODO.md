# Smart Grid Control Center — TODO

## Phase 0: Project Foundation

### 0.1 Monorepo & Tooling
- [x] Scaffold Turborepo with Bun workspaces
- [x] Create `apps/backend`, `apps/frontend`, `packages/shared`, `packages/config`
- [x] Root `package.json` — Bun workspaces, Biome, Turbo scripts
- [x] `biome.json` — shared linter/formatter config
- [x] `.env.example` with all required variables
- [x] `.gitignore` — includes `local.db`, `.env`, `.next`, `dist`
- [x] Agent rules cloned into `.agents/rules/`, IDE adapter files generated
- [x] `bun install` — install all workspace dependencies
- [x] Verify `bunx biome check .` passes on empty project

### 0.2 packages/shared — Core Types & Infrastructure
- [x] `src/schema.ts` — all Drizzle table definitions:
  - `users` (id, email, passwordHash, role, isActive, createdAt)
  - `devices` (id, userId, name, description, connectionType, host, port, topic, threshold, isCritical, overrideActive, overrideState, currentState, createdAt)
  - `deviceCommandsLog` (id, deviceId, command, triggeredBy, priceAtTime, createdAt)
  - `prices` (id, timestamp, priceEurMwh, source)
  - `savingsConfig` (userId, fixedRateEurKwh, updatedAt)
  - `notificationSettings` (userId, channel, telegramChatId, discordWebhookUrl, criticalPriceThreshold, updatedAt)
- [x] `src/db.ts` — PGLite/PostgreSQL adapter (branch on `DATABASE_URL`)
- [x] `src/validators.ts` — all TypeBox schemas (reused on both backend and frontend):
  - Auth: `LoginSchema`, `RegisterSchema`
  - User: `CreateUserSchema`, `UpdateUserSchema`
  - Device: `CreateDeviceSchema`, `UpdateDeviceSchema`, `ToggleSchema`, `OverrideSchema`
  - Savings: `SavingsConfigSchema`
  - Notifications: `NotificationSettingsSchema`
- [x] `src/types.ts` — `Static<>` derived TS types exported for use
- [x] `src/logger.ts` — structured JSON logger (`INFO` / `WARNING` / `ERROR` / `CRITICAL`)
- [x] `src/index.ts` — barrel export of all above
- [x] `drizzle.config.ts` (root) — drizzle-kit config for PostgreSQL
- [x] `drizzle.config.local.ts` (root) — drizzle-kit config for PGLite

---

## Phase 1: Backend

### 1.1 App Entry & Infrastructure
- [x] `src/index.ts` — Elysia app, register all modules, start server on `config.port`
- [x] `src/config.ts` — validate required env vars at startup, export typed config
- [x] `src/middleware/auth.ts` — JWT verification middleware (attach `user` to context)
- [x] `src/middleware/role.ts` — master-only guard middleware
- [x] Elysia global error handler — return `{ error: string }`, never stack traces

### 1.2 Auth module (`src/routes/auth.ts`)
- [x] `POST /api/auth/register` — first user only; auto-assign `master` role if no users exist
- [x] `POST /api/auth/login` — verify password with argon2, return signed JWT
- [x] `POST /api/auth/logout` — invalidate session (clear JWT cookie / blacklist token)
- [x] `GET /api/auth/me` — return current authenticated user
- [x] TypeBox schema validation on all endpoints (use shared schemas)

### 1.3 Users module (`src/routes/users.ts`) — master only
- [x] `GET /api/users` — list all users
- [x] `POST /api/users` — create user (master creates accounts for others)
- [x] `PATCH /api/users/:id` — update user
- [x] `DELETE /api/users/:id` — delete user
- [x] `PATCH /api/users/:id/deactivate` — soft-deactivate user

### 1.4 Devices module (`src/routes/devices.ts`)
- [x] `GET /api/devices` — devices for current user only
- [x] `POST /api/devices` — create device + test connection (HTTP ping or MQTT connect)
- [x] `PATCH /api/devices/:id` — update device (owner only)
- [x] `DELETE /api/devices/:id` — delete device (owner only)
- [x] `GET /api/devices/:id/status` — fetch current device state
- [x] `POST /api/devices/:id/toggle` — manual on/off + log entry
- [x] `POST /api/devices/:id/override` — enable/disable override mode
- [x] `GET /api/devices/:id/logs` — paginated command history

### 1.5 Prices module (`src/routes/prices.ts`)
- [x] `GET /api/prices/current` — latest price from DB
- [x] `GET /api/prices/forecast` — next 24h from Elering API (cache in DB)
- [x] `GET /api/prices/history` — prices by date range (`?from=&to=`)

### 1.6 Savings module (`src/routes/savings.ts`)
- [x] `GET /api/savings` — calculate savings for period (`?period=day|week|month`)
  - Formula: `(fixedRate - exchangePrice) × consumption × duration`
- [x] `GET /api/savings/config` — user's fixed tariff
- [x] `PUT /api/savings/config` — update fixed tariff

### 1.7 Notifications module (`src/routes/notifications.ts`)
- [x] `GET /api/notifications/settings` — current settings
- [x] `PUT /api/notifications/settings` — update channel + thresholds

### 1.8 Services
- [x] `src/services/elering.ts` — fetch prices from Elering API
  - Graceful degradation: if API fails → use last known price from DB + WARNING log
  - Parse `data.ee[]` from response
- [x] `src/services/device-control.ts` — send command to device (HTTP or MQTT)
  - Retry logic with exponential backoff
  - Log command + result in `deviceCommandsLog` (in a transaction)
- [x] `src/services/automation.ts` — cron logic:
  - On startup: fetch current price
  - Every hour: check all active devices, compare price vs threshold, toggle if needed
  - Skip devices with `overrideActive = true`
- [x] `src/services/savings.ts` — savings calculation engine
- [x] `src/services/notifications.ts` — send Telegram / Discord notifications
  - Triggers: price > threshold, device auto-switched, device disconnected

### 1.9 WebSocket (`src/ws/handler.ts`)
- [x] Single `/ws` endpoint
- [x] Broadcast `price_update` every time new price is fetched
- [x] Broadcast `device_state_changed` on every toggle
- [x] Broadcast `device_disconnected` on connection failure
- [x] Broadcast `price_threshold_alert` when price exceeds critical threshold

### 1.10 Backend Tests (`apps/backend/tests/`)
- [x] `automation.test.ts` — threshold algorithm (price ≥ threshold → off, price < threshold → on)
  - Edge case: price < 0 → handle without infinite loop
  - Edge case: Elering API down → use last known price
- [x] `savings.test.ts` — savings calculator, all three periods
  - Edge case: no data for period → return 0
- [x] `auth.test.ts` — JWT middleware, role guard
- [x] `device-control.test.ts` — command sending, retry logic
  - Edge case: device unreachable → retry 3x, log error
- [x] All tests mock Elering API and DB (bun:test mock.module)
- [x] 28 / 28 tests passing

---

## Phase 2: Frontend

### 2.1 App Infrastructure
- [x] Scaffold Vinext (via `vinext` package) — App Router structure
- [x] Configure Tailwind CSS (`tailwind.config.ts`)
- [x] shadcn/ui base components: Button, Input, Card, Dialog, Badge, Table, Select, Tabs, Toast
- [x] `src/lib/api.ts` — typed fetch wrapper pointing to backend (`NEXT_PUBLIC_API_URL`)
- [x] `src/lib/queryClient.ts` — React Query client configuration
- [x] `app/layout.tsx` — root layout with `QueryClientProvider` + `Toaster`
- [x] `middleware.ts` — Vinext middleware: verify JWT cookie, redirect unauth → `/login`
- [x] `src/hooks/useWebSocket.ts` — WebSocket connection with exponential backoff reconnect

### 2.2 Zustand Stores
- [x] `src/stores/authStore.ts` — user session (user profile, persist, logout action)
- [x] `src/stores/wsStore.ts` — WebSocket connection state + latest events

### 2.3 Pages & Components

#### Login (`/login`)
- [x] `app/login/page.tsx`
- [x] `components/organisms/LoginForm.tsx` — react-hook-form + typeboxResolver, calls `/api/auth/login`

#### Control Center (`/`) — Main Dashboard
- [x] `app/page.tsx`
- [x] `components/organisms/PriceBanner.tsx` — current price, live update via WebSocket
- [x] `components/organisms/DeviceGrid.tsx` — grid of all user devices
- [x] `components/molecules/DeviceCard.tsx` — device name, state, threshold, toggle + override buttons
  - Optimistic UI update on toggle (rollback on error)
- [x] `components/atoms/PriceIndicator.tsx` — color-coded price display (green/yellow/red)
- [x] `components/atoms/StatusBadge.tsx` — on/off/override/disconnected badge

#### Devices (`/devices`)
- [x] `app/devices/page.tsx` — device table with delete
- [x] `app/devices/new/page.tsx` — new device form page
- [x] `app/devices/[id]/page.tsx` — device detail (edit form + command log tabs)
- [x] `components/organisms/DeviceForm.tsx` — add/edit device form (HTTP/MQTT type selector)

#### Forecast (`/forecast`)
- [x] `app/forecast/page.tsx`
- [x] `components/organisms/ForecastChart.tsx` — 24h price area chart (recharts)

#### Savings (`/savings`)
- [x] `app/savings/page.tsx` — day/week/month tabs + fixed rate config form
- [x] `components/organisms/SavingsChart.tsx` — bar chart of savings per hour

#### Settings (`/settings`)
- [x] `app/settings/page.tsx` — notification channel + threshold config

#### Admin Users (`/admin/users`) — master only
- [x] `app/admin/users/page.tsx` — users table (create / deactivate / delete)

### 2.4 React Query Hooks (`src/hooks/`)
- [x] `usePrices.ts` — `useCurrentPrice` + `useForecast`
- [x] `useDevices.ts` — list, mutations (toggle, override, CRUD), device logs
- [x] `useSavings.ts` — savings report by period + config mutations
- [x] `useUsers.ts` — admin user management (create, update, delete, deactivate)
- [x] `useNotificationSettings.ts` — get/update notification config

---

## Phase 3: Infrastructure & DevOps

### 3.1 Docker
- [ ] `apps/backend/Dockerfile` — Bun multi-stage build
- [ ] `apps/frontend/Dockerfile` — Vinext build → Node.js production server
- [ ] `docker-compose.yml` (root) — postgres + backend + frontend services
- [ ] `.dockerignore` files for both apps

### 3.2 CI/CD
- [ ] `.github/workflows/ci.yml` — on push/PR: `bun install` → `biome check` → `tsc` → `bun test`
- [ ] `.github/workflows/deploy.yml` — on merge to main: build Docker images → push → trigger Coolify

### 3.3 Drizzle Migrations
- [ ] Run `bunx drizzle-kit generate` to generate initial migration
- [ ] Run `bunx drizzle-kit migrate` to apply (local PGLite)
- [ ] Verify migration works against real PostgreSQL as well

---

## Phase 4: Documentation

- [ ] `docs/architecture.md` — monorepo structure, data flow, key design decisions
- [ ] `docs/api.md` — all API endpoints, request/response shapes, auth requirements
- [ ] `docs/state.md` — frontend state management map (Zustand stores + React Query keys)
- [ ] `README.md` — update with project description, setup instructions, dev commands
