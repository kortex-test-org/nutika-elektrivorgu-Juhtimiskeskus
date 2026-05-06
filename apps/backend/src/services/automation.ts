import { logger } from "@smartgrid/shared"
import { getAllActiveDevices } from "../db/repository/device"
import { getAllSettingsWithThreshold } from "../db/repository/notification"
import { getLatestPrice } from "../db/repository/price"
import { wsManager } from "../ws/manager"
import { sendDeviceCommand } from "./device-control"
import { fetchAndStorePrices } from "./elering"

export const runAutomationCycle = async (): Promise<void> => {
  await fetchAndStorePrices()

  const latestPrice = await getLatestPrice()

  if (!latestPrice) {
    logger.warning("No price data available, skipping automation cycle")
    return
  }

  const currentPrice = Number(latestPrice.priceEurMwh)

  wsManager.broadcast({
    type: "price_update",
    data: {
      priceEurMwh: currentPrice,
      timestamp: latestPrice.timestamp.toISOString(),
    },
  })

  const thresholdSettings = await getAllSettingsWithThreshold()
  for (const setting of thresholdSettings) {
    if (!setting.criticalPriceThreshold) continue
    const threshold = Number(setting.criticalPriceThreshold)
    if (currentPrice > threshold) {
      wsManager.broadcast({
        type: "price_threshold_alert",
        data: { priceEurMwh: currentPrice, threshold },
      })
      break
    }
  }

  const allDevices = await getAllActiveDevices()

  for (const device of allDevices) {
    if (device.overrideActive) continue
    if (device.threshold === null || device.threshold === undefined) continue

    const threshold = Number(device.threshold)
    const shouldBeOn = currentPrice < threshold

    if (device.currentState !== shouldBeOn) {
      await sendDeviceCommand({
        deviceId: device.id,
        host: device.host,
        port: device.port,
        topic: device.topic,
        connectionType: device.connectionType,
        command: shouldBeOn ? "on" : "off",
        triggeredBy: "auto",
        priceAtTime: currentPrice,
      })

      logger.info("Automation toggled device", {
        deviceId: device.id,
        command: shouldBeOn ? "on" : "off",
        priceEurMwh: currentPrice,
        threshold,
      })
    }
  }
}
