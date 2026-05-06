import { logger } from "@smartgrid/shared"
import { getNotificationSettings } from "../db/repository/notification"

const sendTelegramMessage = async (chatId: string, message: string): Promise<void> => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    logger.warning("TELEGRAM_BOT_TOKEN not set, skipping Telegram notification")
    return
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  }).catch((error) => {
    logger.error("Telegram API request failed", { error: String(error) })
    return null
  })

  if (!response?.ok) {
    logger.error("Telegram notification failed", { status: response?.status })
  }
}

const sendDiscordMessage = async (webhookUrl: string, message: string): Promise<void> => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  }).catch((error) => {
    logger.error("Discord webhook request failed", { error: String(error) })
    return null
  })

  if (!response?.ok) {
    logger.error("Discord notification failed", { status: response?.status })
  }
}

export const sendNotification = async (userId: string, message: string): Promise<void> => {
  const settings = await getNotificationSettings(userId)

  if (!settings?.channel) return

  if (settings.channel === "telegram" && settings.telegramChatId) {
    await sendTelegramMessage(settings.telegramChatId, message)
  } else if (settings.channel === "discord" && settings.discordWebhookUrl) {
    await sendDiscordMessage(settings.discordWebhookUrl, message)
  }
}
