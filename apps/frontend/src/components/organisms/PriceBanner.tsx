"use client"

import { Wifi, WifiOff } from "lucide-react"
import { PriceIndicator } from "@/components/atoms/PriceIndicator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentPrice } from "@/hooks/usePrices"
import { useWsStore } from "@/stores/wsStore"

export function PriceBanner() {
  const { data: dbPrice, isLoading } = useCurrentPrice()
  const wsPrice = useWsStore((s) => s.latestPriceUpdate)
  const connected = useWsStore((s) => s.connected)

  const price = wsPrice ? Number(wsPrice.priceEurMwh) : dbPrice ? Number(dbPrice.priceEurMwh) : null

  const timestamp = wsPrice?.timestamp ?? dbPrice?.timestamp ?? null

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Praegune elektrihind</CardTitle>
        <div className="flex items-center gap-2">
          {connected ? (
            <Badge
              variant="success"
              className="gap-1 bg-violet-500/15 text-violet-300 border border-violet-500/40"
            >
              <Wifi className="h-3 w-3" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <WifiOff className="h-3 w-3" />
              Ühenduseta
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-2">
        {isLoading && price === null ? (
          <div className="h-12 w-40 animate-pulse rounded-lg bg-muted" />
        ) : price !== null ? (
          <PriceIndicator priceEurMwh={price} showLabel />
        ) : (
          <span className="text-muted-foreground text-sm">Hind pole saadaval</span>
        )}
        {timestamp && (
          <span className="text-xs text-muted-foreground">
            Uuendatud: {new Date(timestamp).toLocaleString("et-EE")}
          </span>
        )}
      </CardContent>
    </Card>
  )
}
