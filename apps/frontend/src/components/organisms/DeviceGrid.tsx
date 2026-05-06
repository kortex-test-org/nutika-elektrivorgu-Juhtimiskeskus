"use client"

import { Server } from "lucide-react"
import { DeviceCard } from "@/components/molecules/DeviceCard"
import { AddDeviceModal } from "@/components/organisms/AddDeviceModal"
import { useDevices } from "@/hooks/useDevices"

export function DeviceGrid() {
  const { data: devices, isLoading, error } = useDevices()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(["sk1", "sk2", "sk3"] as const).map((k) => (
          <div key={k} className="h-44 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-400 text-sm">
        Seadmeid ei õnnestunud laadida: {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Minu seadmed</h2>
        <AddDeviceModal />
      </div>
      {devices && devices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 rounded-xl border border-dashed border-border text-muted-foreground">
          <Server className="h-10 w-10 opacity-40" />
          <p className="font-medium">Seadmeid pole veel lisatud</p>
          <p className="text-sm">Lisa esimene seade, et alustada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices?.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  )
}
