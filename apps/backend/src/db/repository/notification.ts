import { db, notificationSettings } from "@smartgrid/shared"
import { eq, isNotNull } from "drizzle-orm"

export const getNotificationSettings = async (userId: string) => {
  return db.query.notificationSettings.findFirst({
    where: eq(notificationSettings.userId, userId),
  })
}

export const getAllSettingsWithThreshold = async () => {
  return db
    .select()
    .from(notificationSettings)
    .where(isNotNull(notificationSettings.criticalPriceThreshold))
}

export const upsertNotificationSettings = async (
  userId: string,
  data: Partial<{
    channel: string | null
    telegramChatId: string | null
    discordWebhookUrl: string | null
    criticalPriceThreshold: string | null
  }>,
) => {
  const result = await db
    .insert(notificationSettings)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: notificationSettings.userId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning()
  return result[0]
}
