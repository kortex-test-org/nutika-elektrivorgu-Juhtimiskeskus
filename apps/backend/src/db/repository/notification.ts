import { notificationSettings, telegramActiveChats } from "@smartgrid/shared"
import { db } from "@smartgrid/shared/db"
import { and, eq, isNotNull } from "drizzle-orm"

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

export const getAllActiveBots = async () => {
  return db
    .select()
    .from(notificationSettings)
    .where(
      and(
        eq(notificationSettings.telegramEnabled, true),
        isNotNull(notificationSettings.telegramBotToken),
      ),
    )
}

export const upsertNotificationSettings = async (
  userId: string,
  data: Partial<{
    telegramEnabled: boolean
    discordEnabled: boolean
    telegramBotToken: string | null
    discordWebhookUrl: string | null
    telegramWhitelistEnabled: boolean
    telegramWhitelist: string | null
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

export const getTelegramChats = async (userId: string) => {
  return db.select().from(telegramActiveChats).where(eq(telegramActiveChats.userId, userId))
}

export const addTelegramChat = async (
  userId: string,
  chatId: string,
  username?: string | null,
  firstName?: string | null,
) => {
  // Check if already registered for this user
  const existing = await db
    .select()
    .from(telegramActiveChats)
    .where(and(eq(telegramActiveChats.userId, userId), eq(telegramActiveChats.chatId, chatId)))

  if (existing.length > 0) return existing[0]

  const result = await db
    .insert(telegramActiveChats)
    .values({
      userId,
      chatId,
      username: username ?? null,
      firstName: firstName ?? null,
    })
    .returning()
  return result[0]
}

export const removeTelegramChat = async (userId: string, chatId: string) => {
  return db
    .delete(telegramActiveChats)
    .where(and(eq(telegramActiveChats.userId, userId), eq(telegramActiveChats.chatId, chatId)))
}
