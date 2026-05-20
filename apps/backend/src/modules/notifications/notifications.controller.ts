import { NotificationSettingsSchema } from "@smartgrid/shared"
import { Elysia } from "elysia"
import {
  getNotificationSettings,
  getTelegramChats,
  upsertNotificationSettings,
} from "../../db/repository/notification"
import { authMiddleware } from "../../middleware/auth"

export const notificationsController = new Elysia({
  prefix: "/api/notifications",
})
  .use(authMiddleware)
  .get("/settings", async ({ user }) => {
    const settings = await getNotificationSettings(user.id)
    const telegramChats = await getTelegramChats(user.id)

    if (!settings) {
      return {
        settings: {
          telegramEnabled: false,
          discordEnabled: false,
          telegramBotToken: null,
          discordWebhookUrl: null,
          telegramWhitelistEnabled: false,
          telegramWhitelist: null,
          criticalPriceThreshold: null,
        },
        telegramChats: [],
      }
    }

    return {
      settings,
      telegramChats,
    }
  })
  .put(
    "/settings",
    async ({ user, body }) => {
      const settings = await upsertNotificationSettings(user.id, {
        telegramEnabled: body.telegramEnabled ?? false,
        discordEnabled: body.discordEnabled ?? false,
        telegramBotToken: body.telegramBotToken ?? null,
        discordWebhookUrl: body.discordWebhookUrl ?? null,
        telegramWhitelistEnabled: body.telegramWhitelistEnabled ?? false,
        telegramWhitelist: body.telegramWhitelist ?? null,
        criticalPriceThreshold: body.criticalPriceThreshold
          ? String(body.criticalPriceThreshold)
          : null,
      })

      const telegramChats = await getTelegramChats(user.id)
      return { settings, telegramChats }
    },
    { body: NotificationSettingsSchema },
  )
