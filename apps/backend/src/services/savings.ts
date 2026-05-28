import type { SavingsPeriod } from "@smartgrid/shared"
import { deviceCommandsLog } from "@smartgrid/shared"
import { db } from "@smartgrid/shared/db"
import { asc, eq } from "drizzle-orm"
import { getDevicesByUserId } from "../db/repository/device"
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

function getDeviceStateAt(
  deviceLogs: any[],
  priceTimestamp: Date,
  deviceCurrentState: boolean | null,
): boolean {
  // Find the last log before or equal to this timestamp
  let lastLog: any = null
  for (const log of deviceLogs) {
    if (new Date(log.createdAt).getTime() <= priceTimestamp.getTime()) {
      lastLog = log
    } else {
      break // Since deviceLogs is ordered by createdAt ascending
    }
  }

  if (lastLog) {
    return lastLog.command === "on"
  }

  // If no log exists before this timestamp, look at the first log after this timestamp
  if (deviceLogs.length > 0) {
    return deviceLogs[0].command === "off" // if it was turned off first, it must have been on before
  }

  // Fallback to current state or false
  return deviceCurrentState ?? false
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

  // Fetch all devices for this user
  const userDevices = await getDevicesByUserId(userId)

  // Fetch all command logs for each device, ordered by date ascending
  const devicesWithLogs = await Promise.all(
    userDevices.map(async (device) => {
      const logs = await db
        .select()
        .from(deviceCommandsLog)
        .where(eq(deviceCommandsLog.deviceId, device.id))
        .orderBy(asc(deviceCommandsLog.createdAt))
      return {
        device,
        logs,
      }
    }),
  )

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

    // Calculate sum of power consumption of all devices that were ON during this hour
    let activePowerConsumption = 0
    for (const item of devicesWithLogs) {
      const isDeviceOn = getDeviceStateAt(item.logs, priceEntry.timestamp, item.device.currentState)
      if (isDeviceOn) {
        activePowerConsumption += Number(item.device.powerConsumption) || 0
      }
    }

    // Savings for this hour in Euros: (savings per kWh) * (kW of active devices) * (1 hour)
    const hourlySavingsEur = savingsEurKwh * activePowerConsumption
    totalSavingsEur += hourlySavingsEur

    details.push({
      timestamp: priceEntry.timestamp.toISOString(),
      exchangePriceEurKwh,
      fixedRateEurKwh,
      savingsEurKwh: Number(hourlySavingsEur.toFixed(4)),
    })
  }

  return {
    totalSavingsEur: Number(totalSavingsEur.toFixed(4)),
    details,
    period,
  }
}
