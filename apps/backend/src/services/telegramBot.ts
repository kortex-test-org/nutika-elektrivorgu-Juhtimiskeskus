import { logger } from "@smartgrid/shared/logger"
import { addTelegramChat, getAllActiveBots } from "../db/repository/notification"

// In-memory map to store the last seen update_id for each bot token to avoid repeating messages
const lastUpdateIds = new Map<string, number>()

/**
 * Helper to send a message to a specific Telegram chat
 */
export const sendTelegramMessage = async (
  botToken: string,
  chatId: string,
  text: string,
): Promise<void> => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    })

    if (!response.ok) {
      logger.error("Failed to send message via Telegram Bot", {
        status: response.status,
        statusText: response.statusText,
      })
    }
  } catch (err) {
    logger.error("Error sending Telegram message", { error: String(err) })
  }
}

/**
 * Polls Telegram updates for all active bot tokens in the system
 */
export const pollAllTelegramBots = async (): Promise<void> => {
  try {
    const activeBots = await getAllActiveBots()
    if (activeBots.length === 0) return

    for (const bot of activeBots) {
      if (!bot.telegramBotToken) continue

      const token = bot.telegramBotToken
      const lastUpdateId = lastUpdateIds.get(token) || 0
      const offset = lastUpdateId > 0 ? lastUpdateId + 1 : 0

      try {
        const response = await fetch(
          `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=1`,
          { method: "GET" },
        )

        if (!response.ok) {
          // If the bot token is invalid, Telegram API returns 401/404, we catch it gracefully
          logger.warning("Telegram getUpdates returned error status for token", {
            status: response.status,
            tokenExcerpt: token.slice(0, 10) + "...",
          })
          continue
        }

        const data = (await response.json()) as {
          ok: boolean
          result?: Array<{
            update_id: number
            message?: {
              chat: {
                id: number
                username?: string
                first_name?: string
              }
              text?: string
            }
          }>
        }

        if (data.ok && data.result && data.result.length > 0) {
          let maxUpdateId = lastUpdateId

          for (const update of data.result) {
            maxUpdateId = Math.max(maxUpdateId, update.update_id)

            if (update.message?.chat?.id) {
              const chat = update.message.chat
              const chatIdStr = String(chat.id)
              const text = update.message.text || ""

              // Register user in the database
              const subscriber = await addTelegramChat(
                bot.userId,
                chatIdStr,
                chat.username || null,
                chat.first_name || null,
              )

              // If it's the /start command, send a nice welcoming confirmation message
              if (text.trim().startsWith("/start")) {
                const name = chat.first_name || chat.username || "Sub"
                const welcomeMsg =
                  `👋 Tere, ${name}! / Hello, ${name}! / Привет, ${name}!\n\n` +
                  `✅ Te olete edukalt tellinud SmartGridi teavitused. Te saate teateid elektri börsihindade ja automaatsete seadmete lülituste kohta.\n\n` +
                  `✅ You have successfully subscribed to SmartGrid notifications. You will receive alerts when electricity prices cross your set threshold or when smart devices are automatically toggled.\n\n` +
                  `✅ Вы успешно подписались на уведомления SmartGrid. Вы будете получать оповещения о ценах на электроэнергию и автоматических переключениях приборов.`

                await sendTelegramMessage(token, chatIdStr, welcomeMsg)
              }
            }
          }

          // Update offset for this token
          lastUpdateIds.set(token, maxUpdateId)
        }
      } catch (botErr) {
        logger.error("Error polling updates for specific Telegram bot", {
          tokenExcerpt: token.slice(0, 10) + "...",
          error: String(botErr),
        })
      }
    }
  } catch (err) {
    logger.error("Error running pollAllTelegramBots cycle", { error: String(err) })
  }
}
