"use client"

import { DeviceGrid } from "@/components/organisms/DeviceGrid"
import { PriceBanner } from "@/components/organisms/PriceBanner"
import { useWebSocket } from "@/hooks/useWebSocket"

export default function DashboardPage() {
  useWebSocket()

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Juhtimiskeskus</h1>
        <p className="text-muted-foreground text-sm">Nutika elektrivõrgu haldusliides</p>
      </div>
      <PriceBanner />
      <DeviceGrid />
    </main>
  )
}
