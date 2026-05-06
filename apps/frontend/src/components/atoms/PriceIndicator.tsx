"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface PriceIndicatorProps {
  priceEurMwh: number
  className?: string
  showLabel?: boolean
}

function getPriceLevel(price: number): "low" | "medium" | "high" {
  if (price < 50) return "low"
  if (price < 150) return "medium"
  return "high"
}

const LEVEL_STYLES = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-red-600 bg-red-50 border-red-200",
} as const

export function PriceIndicator({ priceEurMwh, className, showLabel = false }: PriceIndicatorProps) {
  const t = useTranslations("priceLevel")
  const level = getPriceLevel(priceEurMwh)
  const priceEurKwh = (priceEurMwh / 1000).toFixed(4)

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <span
        className={cn(
          "rounded-lg border px-3 py-1.5 text-2xl font-bold tabular-nums",
          LEVEL_STYLES[level],
        )}
      >
        {priceEurKwh} €/kWh
      </span>
      {showLabel && (
        <span className={cn("text-xs font-medium", LEVEL_STYLES[level].split(" ")[0])}>
          {t(level)}
        </span>
      )}
    </div>
  )
}
