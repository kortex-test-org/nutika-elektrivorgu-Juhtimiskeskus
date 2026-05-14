import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsState {
  isVacationMode: boolean
  vacationDeviceIds: string[]
  priceUnit: "mwh" | "kwh"
  setVacationMode: (active: boolean, deviceIds?: string[]) => void
  setPriceUnit: (unit: "mwh" | "kwh") => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isVacationMode: false,
      vacationDeviceIds: [],
      priceUnit: "mwh",
      setVacationMode: (active, deviceIds = []) =>
        set({
          isVacationMode: active,
          vacationDeviceIds: active ? deviceIds : [],
        }),
      setPriceUnit: (unit) => set({ priceUnit: unit }),
    }),
    {
      name: "smartgrid-settings",
    },
  ),
)
