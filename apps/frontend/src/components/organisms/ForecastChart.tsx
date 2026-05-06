"use client"

import { useFormatter } from "next-intl"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface PriceEntry {
  timestamp: string
  priceEurMwh: string
}

interface ForecastChartProps {
  data: PriceEntry[]
}

function priceColor(price: number): string {
  if (price < 50) return "#22c55e"
  if (price < 150) return "#eab308"
  return "#ef4444"
}

interface TooltipPayload {
  value: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const price = payload[0]?.value ?? 0
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-lg">
      <p className="font-mono text-muted-foreground">{label}</p>
      <p className="font-semibold" style={{ color: priceColor(price) }}>
        {(price / 1000).toFixed(4)} €/kWh
      </p>
    </div>
  )
}

export function ForecastChart({ data }: ForecastChartProps) {
  const format = useFormatter()
  const chartData = data.map((entry) => ({
    time: format.dateTime(new Date(entry.timestamp), {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }),
    price: Number(entry.priceEurMwh),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(v: number) => `${v}`}
          label={{ value: "€/MWh", angle: -90, position: "insideLeft", fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
