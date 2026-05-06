import type { SavingsPeriod } from "@smartgrid/shared"
import { getPricesByRange } from "../db/repository/price"
import { getSavingsConfig } from "../db/repository/savings"

const PERIOD_RANGES: Record<SavingsPeriod, () => { from: Date; to: Date }> = {
  day: () => {
    const to = new Date()
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000)
    return { from, to }
  },
  week: () => {
    const to = new Date()
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
    return { from, to }
  },
  month: () => {
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { from, to }
  },
}

export const calculateSavings = async (userId: string, period: SavingsPeriod) => {
  const savingsConf = await getSavingsConfig(userId)

  if (!savingsConf) {
    return { totalSavingsEur: 0, details: [], period }
  }

  const fixedRateEurKwh = Number(savingsConf.fixedRateEurKwh)
  const { from, to } = PERIOD_RANGES[period]()
  const priceHistory = await getPricesByRange(from, to)

  if (priceHistory.length === 0) {
    return { totalSavingsEur: 0, details: [], period }
  }

  let totalSavingsEur = 0
  const details: Array<{
    timestamp: string
    exchangePriceEurKwh: number
    fixedRateEurKwh: number
    savingsEurKwh: number
  }> = []

  for (const priceEntry of priceHistory) {
    const exchangePriceEurKwh = Number(priceEntry.priceEurMwh) / 1000
    const savingsEurKwh = fixedRateEurKwh - exchangePriceEurKwh
    totalSavingsEur += savingsEurKwh

    details.push({
      timestamp: priceEntry.timestamp.toISOString(),
      exchangePriceEurKwh,
      fixedRateEurKwh,
      savingsEurKwh,
    })
  }

  return {
    totalSavingsEur: Number(totalSavingsEur.toFixed(4)),
    details,
    period,
  }
}
