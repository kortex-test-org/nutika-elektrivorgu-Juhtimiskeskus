"use client"

import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/stores/settingsStore"

export function PriceUnitToggle() {
  const { priceUnit, setPriceUnit } = useSettingsStore()

  return (
    <div className="flex bg-muted rounded-lg p-1 border border-border">
      <Button
        variant={priceUnit === "mwh" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter"
        onClick={() => setPriceUnit("mwh")}
      >
        MWh
      </Button>
      <Button
        variant={priceUnit === "kwh" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter"
        onClick={() => setPriceUnit("kwh")}
      >
        kWh
      </Button>
    </div>
  )
}
