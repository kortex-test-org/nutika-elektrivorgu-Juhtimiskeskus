"use client"

import { Calendar, Info } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDevices } from "@/hooks/useDevices"

interface ForecastEntry {
  id: string
  timestamp: string
  priceEurMwh: string
  source: string
}

interface DeviceSwitchPlanProps {
  forecast: ForecastEntry[]
}

export function DeviceSwitchPlan({ forecast }: DeviceSwitchPlanProps) {
  const t = useTranslations("forecast")
  const format = useFormatter()
  const { data: devices, isLoading } = useDevices()
  const [hoveredHour, setHoveredHour] = useState<{
    deviceName: string
    hourStr: string
    price: number
    threshold: number
    shouldBeOn: boolean
  } | null>(null)

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">{t("timelineTitle")}</CardTitle>
          <CardDescription>{t("timelineSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl animate-pulse">🐾</span>
            <p className="text-xs text-muted-foreground animate-pulse">
              Загружаем кошачий план... Мяу!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Only show devices that have a threshold configured
  const thresholdDevices =
    devices?.filter((d) => d.threshold !== null && d.threshold !== undefined) || []

  if (thresholdDevices.length === 0) {
    return (
      <Card className="w-full border-dashed border-2">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-20 h-20 text-muted-foreground opacity-50">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              {/* Cute sleeping cat outline */}
              <path
                d="M 40 55 C 40 45, 60 45, 60 55"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              <path d="M 45 48 L 41 38 L 49 43" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M 55 48 L 59 38 L 51 43" stroke="currentColor" strokeWidth="2" fill="none" />
              <path
                d="M 46 51 A 1.5 1.5 0 0 0 49 51 M 51 51 A 1.5 1.5 0 0 0 54 51"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div className="max-w-md">
            <h3 className="font-semibold text-lg text-foreground">{t("noThresholdDevices")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("noThresholdHint")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-lg border border-violet-500/10 dark:border-violet-500/5 overflow-hidden transition-all duration-300 hover:shadow-violet-500/5">
      <CardHeader className="pb-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2 text-violet-500">
          <Calendar className="h-5 w-5" />
          <CardTitle className="text-lg heading-gradient font-bold">{t("timelineTitle")}</CardTitle>
        </div>
        <CardDescription className="text-xs">{t("timelineSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          {thresholdDevices.map((device) => {
            const thresholdVal = Number(device.threshold)
            const powerVal = Number(device.powerConsumption) || 0

            return (
              <div
                key={device.id}
                className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4 items-center p-3 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30 group"
              >
                {/* Left col: Device Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground group-hover:text-violet-500 transition-colors">
                      {device.name}
                    </span>
                    {device.isCritical && (
                      <Badge variant="warning_dark" className="text-[9px] px-1 py-0 uppercase">
                        🐾 Крит
                      </Badge>
                    )}
                  </div>
                  {device.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {device.description}
                    </span>
                  )}
                  <div className="flex gap-2 text-[11px] text-muted-foreground font-mono mt-1">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-violet-500">
                      ⚡ {powerVal.toFixed(2)} кВт
                    </span>
                    <span className="bg-muted px-1.5 py-0.5 rounded">
                      🏷️ &lt; {(thresholdVal / 1000).toFixed(4)} €/kWh
                    </span>
                  </div>
                </div>

                {/* Right col: 24h Blocks */}
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5">
                    {forecast.map((entry) => {
                      const priceVal = Number(entry.priceEurMwh)
                      const shouldBeOn = priceVal < thresholdVal
                      const date = new Date(entry.timestamp)
                      const hourStr = format.dateTime(date, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })

                      const isHovered =
                        hoveredHour &&
                        hoveredHour.deviceName === device.name &&
                        hoveredHour.hourStr === hourStr

                      return (
                        <div
                          key={entry.id}
                          className={`h-9 rounded-md cursor-pointer transition-all duration-200 relative ${
                            shouldBeOn
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/30 hover:scale-105"
                              : "bg-muted dark:bg-muted/30 border border-border/40 hover:bg-muted/70 hover:scale-105"
                          } ${isHovered ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-background" : ""}`}
                          onMouseEnter={() =>
                            setHoveredHour({
                              deviceName: device.name,
                              hourStr,
                              price: priceVal,
                              threshold: thresholdVal,
                              shouldBeOn,
                            })
                          }
                          onMouseLeave={() => setHoveredHour(null)}
                        >
                          {/* Indicator dot */}
                          <span className="absolute bottom-1 right-1 text-[8px] opacity-40 select-none">
                            {shouldBeOn ? "⚡" : "💤"}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Hours timeline ticks */}
                  {forecast.length > 0 && (
                    <div className="flex justify-between text-[9px] text-muted-foreground font-mono px-1">
                      <span>
                        {format.dateTime(new Date(forecast[0]?.timestamp || ""), {
                          hour: "2-digit",
                        })}
                      </span>
                      <span>
                        {format.dateTime(
                          new Date(forecast[Math.floor(forecast.length / 2)]?.timestamp || ""),
                          { hour: "2-digit" },
                        )}
                      </span>
                      <span>
                        {format.dateTime(new Date(forecast[forecast.length - 1]?.timestamp || ""), {
                          hour: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Hover info panel */}
        <div className="min-h-12 border-t border-border/50 pt-3 flex items-center justify-center text-xs">
          {hoveredHour ? (
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg border border-border/40 animate-fade-in">
              <span className="font-semibold text-violet-500">{hoveredHour.deviceName}</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-mono">🕒 {hoveredHour.hourStr}</span>
              <span className="text-muted-foreground">|</span>
              <span>
                Цена:{" "}
                <strong className="font-mono">{(hoveredHour.price / 1000).toFixed(4)} €/kWh</strong>
              </span>
              <span className="text-muted-foreground">|</span>
              <span>
                Порог:{" "}
                <strong className="font-mono">
                  {(hoveredHour.threshold / 1000).toFixed(4)} €/kWh
                </strong>
              </span>
              <span className="text-muted-foreground">|</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded ${
                  hoveredHour.shouldBeOn
                    ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {hoveredHour.shouldBeOn ? t("statusOn") : t("statusOff")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4 text-violet-500 animate-pulse" />
              <span>
                Наведите на сегмент временной шкалы, чтобы увидеть подробности работы прибора! 🐾
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
