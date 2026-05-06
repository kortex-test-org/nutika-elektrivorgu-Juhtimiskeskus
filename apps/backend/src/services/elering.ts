import { logger } from "@smartgrid/shared/logger"
import { getLatestPrice, upsertPrices } from "../db/repository/price"

const ELERING_API_URL = "https://dashboard.elering.ee/api/nps/price"

interface EleringPriceEntry {
  timestamp: number
  price: number
}

interface EleringResponse {
  success: boolean
  data: {
    ee: EleringPriceEntry[]
  }
}

export const fetchAndStorePrices = async (): Promise<void> => {
  const now = new Date()
  const from = Math.floor(now.getTime() / 1000)
  const to = from + 24 * 60 * 60

  const response = await fetch(`${ELERING_API_URL}?start=${from}&end=${to}`).catch((error) => {
    logger.warning("Elering API request failed", { error: String(error) })
    return null
  })

  if (!response?.ok) {
    logger.warning("Elering API returned non-ok status", {
      status: response?.status,
    })
    return
  }

  const body = (await response.json().catch(() => null)) as EleringResponse | null

  if (!body?.success || !Array.isArray(body.data?.ee)) {
    logger.warning("Elering API returned unexpected format")
    return
  }

  const rows = body.data.ee.map((entry) => ({
    timestamp: new Date(entry.timestamp * 1000),
    priceEurMwh: entry.price.toFixed(2),
    source: "elering",
  }))

  await upsertPrices(rows)
  logger.info("Prices fetched and stored from Elering", { count: rows.length })
}

export const getCurrentPrice = async () => {
  return getLatestPrice()
}
