# Frontend State Management

## Zustand Stores

### `authStore` (`src/stores/authStore.ts`)

Persisted to `localStorage` via `zustand/middleware/persist`.

```ts
interface AuthState {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  logout: () => void
}
```

**Used by:** Layout (auto-redirect on logout), DeviceGrid (user ID for queries), admin guards.

---

### `wsStore` (`src/stores/wsStore.ts`)

In-memory only (not persisted).

```ts
interface WsState {
  status: "connected" | "connecting" | "disconnected"
  latestPrice: PriceUpdate | null
  latestDeviceEvent: DeviceStateEvent | null
  latestAlert: ThresholdAlert | null
  setStatus: (status) => void
  handleMessage: (event: WsEvent) => void
}
```

**Used by:** `useWebSocket` hook (writes), `PriceBanner` and `DeviceCard` (reads via selector).

---

## React Query Keys

Canonical key factory pattern. All keys are in the hooks they belong to.

| Hook | Key | Staletime |
|---|---|---|
| `useCurrentPrice` | `["prices", "current"]` | 60s |
| `useForecast` | `["prices", "forecast"]` | 300s |
| `usePriceHistory` | `["prices", "history", { from, to }]` | 300s |
| `useDevices` | `["devices"]` | 30s |
| `useDevice` | `["devices", id]` | 30s |
| `useDeviceLogs` | `["devices", id, "logs", { page }]` | 60s |
| `useSavings` | `["savings", period]` | 300s |
| `useSavingsConfig` | `["savings", "config"]` | 300s |
| `useUsers` | `["users"]` | 60s |
| `useNotificationSettings` | `["notifications", "settings"]` | 300s |

---

## WebSocket ↔ React Query Integration

`useWebSocket` listens for server events and invalidates React Query cache:

| WS event | Invalidates |
|---|---|
| `price_update` | `["prices", "current"]`, `["savings"]` |
| `device_state_changed` | `["devices"]` |
| `device_disconnected` | `["devices"]` |
| `price_threshold_alert` | — (shows toast only) |

The `wsStore` also stores the latest event so components can show real-time values without re-fetching.

---

## Optimistic Updates

`DeviceCard` toggle applies an optimistic update via `useMutation`:
1. Immediately flip `currentState` in the `["devices"]` cache
2. On error: roll back to the previous value
3. On settle: invalidate `["devices"]` to sync with server

This keeps the UI responsive even on slow backend responses.
