"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { DeviceCard } from "@/components/molecules/DeviceCard"
import { Button } from "@/components/ui/button"
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
      <div className="text-destructive text-sm">
        Seadmeid ei õnnestunud laadida: {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Minu seadmed</h2>
        <Button asChild size="sm">
          <Link href="/devices/new">
            <Plus className="h-4 w-4 mr-1" />
            Lisa seade
          </Link>
        </Button>
      </div>
      {devices && devices.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border rounded-xl border-dashed">
          <p className="font-medium">Seadmeid pole veel lisatud</p>
          <p className="text-sm mt-1">Lisa esimene seade, et alustada</p>
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
