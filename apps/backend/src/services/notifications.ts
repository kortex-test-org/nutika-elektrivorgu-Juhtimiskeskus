import { logger } from "@smartgrid/shared/logger"
import {
  getNotificationSettings,
  getTelegramChats,
  removeTelegramChat,
} from "../db/repository/notification"

const sendTelegramMessage = async (
  botToken: string,
  userId: string,
  chatId: string,
  message: string,
): Promise<void> => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    })

    if (!response.ok) {
      logger.error("Telegram notification failed", { status: response.status, chatId })
      // Auto-cleanup if user blocked the bot (403) or chat not found (400)
      if (response.status === 403 || response.status === 400) {
        logger.info(`Removing inactive or blocked subscriber chat ${chatId} for user ${userId}`)
        await removeTelegramChat(userId, chatId)
      }
    }
  } catch (error) {
    logger.error("Telegram API request failed", { error: String(error) })
  }
}

const sendDiscordMessage = async (webhookUrl: string, message: string): Promise<void> => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    })

    if (!response.ok) {
      logger.error("Discord notification failed", { status: response.status })
    }
  } catch (error) {
    logger.error("Discord webhook request failed", { error: String(error) })
  }
}

export const sendNotification = async (userId: string, message: string): Promise<void> => {
  const settings = await getNotificationSettings(userId)
  if (!settings) return

  const sendPromises: Promise<void>[] = []

  // Telegram delivery to all subscribers
  if (settings.telegramEnabled && settings.telegramBotToken) {
    let chats = await getTelegramChats(userId)

    if (settings.telegramWhitelistEnabled) {
      const whitelistRaw = settings.telegramWhitelist || ""
      const whitelistEntries = whitelistRaw
        .split(",")
        .map((entry) => entry.trim().replace(/^@/, "").toLowerCase())
        .filter((entry) => entry.length > 0)

      chats = chats.filter((chat) => {
        const chatIdMatch = whitelistEntries.includes(chat.chatId)
        const usernameMatch = chat.username
          ? whitelistEntries.includes(chat.username.replace(/^@/, "").toLowerCase())
          : false
        return chatIdMatch || usernameMatch
      })
    }

    for (const chat of chats) {
      sendPromises.push(
        sendTelegramMessage(settings.telegramBotToken, userId, chat.chatId, message),
      )
    }
  }

  // Discord delivery
  if (settings.discordEnabled && settings.discordWebhookUrl) {
    sendPromises.push(sendDiscordMessage(settings.discordWebhookUrl, message))
  }

  if (sendPromises.length > 0) {
    await Promise.all(sendPromises).catch((err) => {
      logger.error("Failed to execute notification delivery promises", { error: String(err) })
    })
  }
}
