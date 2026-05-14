"use client"

import { Activity, WifiOff } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { useCurrentPrice } from "@/hooks/usePrices"
import { useWsStore } from "@/stores/wsStore"

export function PriceBanner() {
  const t = useTranslations("priceBanner")
  const format = useFormatter()
  const { data: dbPrice, isLoading } = useCurrentPrice()
  const wsPrice = useWsStore((s) => s.latestPriceUpdate)
  const connected = useWsStore((s) => s.connected)

  const price = wsPrice ? Number(wsPrice.priceEurMwh) : dbPrice ? Number(dbPrice.priceEurMwh) : null
  const timestamp = wsPrice?.timestamp ?? dbPrice?.timestamp ?? null
  const priceEurKwh = price !== null ? (price / 1000).toFixed(4) : null

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("title")}
        </span>
        {connected ? (
          <Badge
            variant="success"
            className="gap-1 h-5 px-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none shadow-none font-bold text-[10px]"
          >
            <Activity className="h-2.5 w-2.5" />
            LIVE
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 h-5 px-1.5 text-muted-foreground border-dashed text-[10px]"
          >
            <WifiOff className="h-2.5 w-2.5" />
            {t("disconnected")}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {isLoading && price === null ? (
          <div className="h-10 w-48 animate-pulse rounded bg-muted/50" />
        ) : price !== null ? (
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-violet-600 dark:text-violet-400">
              {priceEurKwh}
            </span>
            <span className="text-xl font-bold text-muted-foreground">€/kWh</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm font-medium italic">
            {t("unavailable")}
          </span>
        )}

        {timestamp && (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1 w-1 rounded-full bg-violet-400" />
            <span className="text-[10px] font-medium text-muted-foreground/80">
              {t("updated")}:{" "}
              {format.dateTime(new Date(timestamp), { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
