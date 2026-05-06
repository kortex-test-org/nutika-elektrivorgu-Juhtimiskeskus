"use client"

import { DeviceGrid } from "@/components/organisms/DeviceGrid"
import { PriceBanner } from "@/components/organisms/PriceBanner"
import { useWebSocket } from "@/hooks/useWebSocket"

export default function DashboardPage() {
  useWebSocket()

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-foreground to-violet-500 bg-clip-text text-transparent">
          Juhtimiskeskus
        </h1>
        <p className="text-muted-foreground text-sm">Nutika elektrivõrgu haldusliides</p>
      </div>
      <div className="animate-fade-up [animation-delay:80ms]">
        <PriceBanner />
      </div>
      <div className="animate-fade-up [animation-delay:160ms]">
        <DeviceGrid />
      </div>
    </main>
  )
}
