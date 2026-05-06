# API Reference

Base URL: `http://localhost:3001` (dev), configured via `NEXT_PUBLIC_API_URL` (prod).

All protected endpoints require `Authorization: Bearer <token>` header or `auth_token` cookie.

## Auth

### POST /api/auth/register
Register the first user (master). Returns 403 if users already exist.

**Body:** `{ email: string, password: string }`
**Response:** `{ token: string, user: { id, email, role } }`
**Auth:** None

### POST /api/auth/login
**Body:** `{ email: string, password: string }`
**Response:** `{ token: string, user: { id, email, role } }`
**Auth:** None

### POST /api/auth/logout
**Response:** `{ success: true }`
**Auth:** Required

### GET /api/auth/me
**Response:** `{ id, email, role, isActive, createdAt }`
**Auth:** Required

---

## Users — master only

### GET /api/users
**Response:** `User[]`

### POST /api/users
**Body:** `{ email: string, password: string, role?: "user" | "master" }`
**Response:** `User`

### PATCH /api/users/:id
**Body:** `Partial<{ email, password, role, isActive }>`
**Response:** `User`

### DELETE /api/users/:id
**Response:** `{ success: true }`

### PATCH /api/users/:id/deactivate
**Response:** `User`

---

## Devices

### GET /api/devices
Returns devices for the authenticated user.
**Response:** `Device[]`

### POST /api/devices
**Body:** `CreateDeviceSchema` — name, connectionType, host, port?, topic?, threshold?, isCritical?
**Response:** `Device`

### PATCH /api/devices/:id
**Body:** `UpdateDeviceSchema` (partial)
**Response:** `Device`

### DELETE /api/devices/:id
**Response:** `{ success: true }`

### GET /api/devices/:id/status
**Response:** `{ id, currentState: boolean }`

### POST /api/devices/:id/toggle
**Body:** `{ state: boolean }`
**Response:** `{ id, command, priceAtTime }`

### POST /api/devices/:id/override
**Body:** `{ active: boolean, state?: boolean }`
**Response:** `Device`

### GET /api/devices/:id/logs
**Query:** `?page=1&limit=20`
**Response:** `{ data: DeviceCommandLog[], total: number }`

---

## Prices

### GET /api/prices/current
**Response:** `{ timestamp, priceEurMwh, source }`

### GET /api/prices/forecast
Returns next 24h prices (fetched from Elering, cached in DB).
**Response:** `Price[]`

### GET /api/prices/history
**Query:** `?from=ISO8601&to=ISO8601`
**Response:** `Price[]`

---

## Savings

### GET /api/savings
**Query:** `?period=day|week|month`
**Response:** `{ period, totalSavingsEur, hoursActive, avgPriceEurMwh }`

### GET /api/savings/config
**Response:** `{ userId, fixedRateEurKwh, updatedAt }`

### PUT /api/savings/config
**Body:** `{ fixedRateEurKwh: number }`
**Response:** `{ userId, fixedRateEurKwh, updatedAt }`

---

## Notifications

### GET /api/notifications/settings
**Response:** `{ channel, telegramChatId?, discordWebhookUrl?, criticalPriceThreshold? }`

### PUT /api/notifications/settings
**Body:** `NotificationSettingsSchema`
**Response:** Updated settings

---

## WebSocket

**Endpoint:** `ws://localhost:3001/ws`

### Inbound (client → server)
No messages expected. Connection is subscribe-only.

### Outbound (server → client)

```ts
{ type: "price_update", data: { priceEurMwh: number, timestamp: string } }
{ type: "device_state_changed", data: { deviceId: string, state: boolean, triggeredBy: "auto" | "manual" } }
{ type: "device_disconnected", data: { deviceId: string } }
{ type: "price_threshold_alert", data: { deviceId: string, priceEurMwh: number, threshold: number } }
```

---

## Error format

All errors return:
```json
{ "error": "Human readable message" }
```
Stack traces are never exposed to clients.
