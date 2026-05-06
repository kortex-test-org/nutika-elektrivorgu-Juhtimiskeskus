import { NotificationSettingsSchema } from "@smartgrid/shared"
import { Elysia } from "elysia"
import {
  getNotificationSettings,
  upsertNotificationSettings,
} from "../../db/repository/notification"
import { authMiddleware } from "../../middleware/auth"

export const notificationsController = new Elysia({
  prefix: "/api/notifications",
})
  .use(authMiddleware)
  .get("/settings", async ({ user, set }) => {
    const settings = await getNotificationSettings(user.id)
    if (!settings) {
      return {
        settings: {
          channel: null,
          telegramChatId: null,
          discordWebhookUrl: null,
          criticalPriceThreshold: null,
        },
      }
    }
    return { settings }
  })
  .put(
    "/settings",
    async ({ user, body }) => {
      const settings = await upsertNotificationSettings(user.id, {
        channel: body.channel ?? null,
        telegramChatId: body.telegramChatId ?? null,
        discordWebhookUrl: body.discordWebhookUrl ?? null,
        criticalPriceThreshold: body.criticalPriceThreshold?.toFixed(2) ?? null,
      })
      return { settings }
    },
    { body: NotificationSettingsSchema },
  )
