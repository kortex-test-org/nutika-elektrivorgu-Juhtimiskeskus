import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface SavedDeviceState {
  id: string
  overrideActive: boolean
  overrideState: boolean | null
  currentState: boolean | null
}

interface SettingsState {
  isVacationMode: boolean
  vacationDeviceIds: string[]
  vacationDevices: SavedDeviceState[]
  priceUnit: "mwh" | "kwh"
  setVacationMode: (active: boolean, devices?: SavedDeviceState[]) => void
  setPriceUnit: (unit: "mwh" | "kwh") => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isVacationMode: false,
      vacationDeviceIds: [],
      vacationDevices: [],
      priceUnit: "mwh",
      setVacationMode: (active, devices = []) =>
        set({
          isVacationMode: active,
          vacationDevices: active ? devices : [],
          vacationDeviceIds: active ? devices.map((d) => d.id) : [],
        }),
      setPriceUnit: (unit) => set({ priceUnit: unit }),
    }),
    {
      name: "smartgrid-settings",
    },
  ),
)
