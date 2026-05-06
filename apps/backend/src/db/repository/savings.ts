import { db, savingsConfig } from "@smartgrid/shared"
import { eq } from "drizzle-orm"

export const getSavingsConfig = async (userId: string) => {
  return db.query.savingsConfig.findFirst({
    where: eq(savingsConfig.userId, userId),
  })
}

export const upsertSavingsConfig = async (userId: string, fixedRateEurKwh: string) => {
  const result = await db
    .insert(savingsConfig)
    .values({ userId, fixedRateEurKwh })
    .onConflictDoUpdate({
      target: savingsConfig.userId,
      set: { fixedRateEurKwh, updatedAt: new Date() },
    })
    .returning()
  return result[0]
}
