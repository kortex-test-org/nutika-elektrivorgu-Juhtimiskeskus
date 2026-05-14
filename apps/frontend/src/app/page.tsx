"use client"

import { useTranslations } from "next-intl"
import { DeviceGrid } from "@/components/organisms/DeviceGrid"
import { PriceBanner } from "@/components/organisms/PriceBanner"
import { useWebSocket } from "@/hooks/useWebSocket"

export default function DashboardPage() {
  const t = useTranslations("dashboard")
  useWebSocket()

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight w-fit heading-gradient">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
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
