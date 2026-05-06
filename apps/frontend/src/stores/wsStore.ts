import type { WSEvent } from "@smartgrid/shared"
import { create } from "zustand"

interface WsState {
  connected: boolean
  latestPriceUpdate: Extract<WSEvent, { type: "price_update" }>["data"] | null
  latestDeviceEvent: Extract<
    WSEvent,
    { type: "device_state_changed" | "device_disconnected" }
  > | null
  latestAlert: Extract<WSEvent, { type: "price_threshold_alert" }>["data"] | null
  setConnected: (connected: boolean) => void
  handleEvent: (event: WSEvent) => void
}

export const useWsStore = create<WsState>()((set) => ({
  connected: false,
  latestPriceUpdate: null,
  latestDeviceEvent: null,
  latestAlert: null,
  setConnected: (connected) => set({ connected }),
  handleEvent: (event) => {
    if (event.type === "price_update") {
      set({ latestPriceUpdate: event.data })
    } else if (event.type === "device_state_changed" || event.type === "device_disconnected") {
      set({ latestDeviceEvent: event })
    } else if (event.type === "price_threshold_alert") {
      set({ latestAlert: event.data })
    }
  },
}))
