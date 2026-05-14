"use client"

import { cn } from "@/lib/utils"

interface PriceIndicatorProps {
  priceEurMwh: number
  className?: string
  size?: "sm" | "md" | "lg"
}

const LEVEL_COLORS = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-rose-600 dark:text-rose-400",
} as const

export const PriceIndicator = ({ priceEurMwh, className, size = "md" }: PriceIndicatorProps) => {
  const priceEurKwh = (priceEurMwh / 1000).toFixed(4)

  const getPriceLevel = (price: number): "low" | "medium" | "high" => {
    if (price < 50) return "low"
    if (price < 150) return "medium"
    return "high"
  }

  const level = getPriceLevel(priceEurMwh)

  const sizeStyles = {
    sm: {
      container: "gap-1",
      value: "text-lg font-black tracking-tighter",
      unit: "text-[10px] font-bold uppercase",
    },
    md: {
      container: "gap-1.5",
      value: "text-2xl font-black tracking-tighter",
      unit: "text-xs font-bold uppercase",
    },
    lg: {
      container: "gap-2",
      value: "text-4xl font-black tracking-tighter",
      unit: "text-base font-bold uppercase",
    },
  }

  const styles = sizeStyles[size]

  return (
    <div className={cn("inline-flex items-baseline", styles.container, className)}>
      <span className={cn(styles.value, LEVEL_COLORS[level])}>{priceEurKwh}</span>
      <span className={cn(styles.unit, "text-muted-foreground")}>€/kWh</span>
    </div>
  )
}
