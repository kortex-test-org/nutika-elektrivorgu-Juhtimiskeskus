import { prices } from "@smartgrid/shared"
import { db } from "@smartgrid/shared/db"
import { and, desc, gte, lte } from "drizzle-orm"

export const getLatestPrice = async () => {
  return db.query.prices.findFirst({
    orderBy: [desc(prices.timestamp)],
  })
}

export const getCurrentPrice = async () => {
  const now = new Date()
  return db.query.prices.findFirst({
    where: lte(prices.timestamp, now),
    orderBy: [desc(prices.timestamp)],
  })
}

export const getPricesByRange = async (from: Date, to: Date) => {
  return db
    .select()
    .from(prices)
    .where(and(gte(prices.timestamp, from), lte(prices.timestamp, to)))
    .orderBy(desc(prices.timestamp))
}

export const upsertPrices = async (
  data: Array<{ timestamp: Date; priceEurMwh: string; source: string }>,
) => {
  if (data.length === 0) return
  await db
    .insert(prices)
    .values(data)
    .onConflictDoUpdate({
      target: prices.timestamp,
      set: { priceEurMwh: prices.priceEurMwh },
    })
}
