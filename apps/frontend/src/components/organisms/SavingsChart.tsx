"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface SavingsDetail {
  timestamp: string
  exchangePriceEurKwh: number
  fixedRateEurKwh: number
  savingsEurKwh: number
}

interface SavingsChartProps {
  details: SavingsDetail[]
  period: "day" | "week" | "month"
}

interface TooltipPayload {
  value: number
  name: string
  color: string
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
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name === "savings" ? "Kokkuhoid" : p.name}: {p.value.toFixed(4)} €/kWh
        </p>
      ))}
    </div>
  )
}

export function SavingsChart({ details, period }: SavingsChartProps) {
  const locale = "et-EE"
  const formatOptions: Intl.DateTimeFormatOptions =
    period === "day" ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit" }

  const chartData = details.map((d) => ({
    time: new Date(d.timestamp).toLocaleString(locale, formatOptions),
    savings: d.savingsEurKwh,
    exchange: d.exchangePriceEurKwh,
    fixed: d.fixedRateEurKwh,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(v: number) => v.toFixed(3)}
          label={{ value: "€/kWh", angle: -90, position: "insideLeft", fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="savings" name="savings" fill="#22c55e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
