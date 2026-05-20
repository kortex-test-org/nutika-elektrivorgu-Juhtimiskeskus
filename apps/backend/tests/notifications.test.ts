import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

const mockGetNotificationSettings = mock(() => Promise.resolve(null as any))
const mockGetTelegramChats = mock(() => Promise.resolve([] as any[]))
const mockRemoveTelegramChat = mock(() => Promise.resolve())

mock.module("../src/db/repository/notification", () => ({
  getNotificationSettings: mockGetNotificationSettings,
  getTelegramChats: mockGetTelegramChats,
  removeTelegramChat: mockRemoveTelegramChat,
  getAllSettingsWithThreshold: () => Promise.resolve([]),
  getAllActiveBots: () => Promise.resolve([]),
  upsertNotificationSettings: () => Promise.resolve(null as any),
  addTelegramChat: () => Promise.resolve(null as any),
}))

let sendNotification: (userId: string, message: string) => Promise<void>

const mockFetch = mock(() => Promise.resolve({ ok: true, status: 200 } as any))
global.fetch = mockFetch

beforeAll(async () => {
  const mod = await import("../src/services/notifications")
  sendNotification = mod.sendNotification
})

beforeEach(() => {
  mockGetNotificationSettings.mockClear()
  mockGetTelegramChats.mockClear()
  mockRemoveTelegramChat.mockClear()
  mockFetch.mockClear()
})

describe("sendNotification", () => {
  it("does nothing when settings are disabled", async () => {
    mockGetNotificationSettings.mockResolvedValue({
      telegramEnabled: false,
      discordEnabled: false,
      telegramBotToken: null,
      discordWebhookUrl: null,
      telegramWhitelistEnabled: false,
      telegramWhitelist: null,
    })

    await sendNotification("user-1", "Test Message")

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("sends telegram message to all subscribers when whitelist is disabled", async () => {
    mockGetNotificationSettings.mockResolvedValue({
      telegramEnabled: true,
      discordEnabled: false,
      telegramBotToken: "token-123",
      discordWebhookUrl: null,
      telegramWhitelistEnabled: false,
      telegramWhitelist: null,
    })

    mockGetTelegramChats.mockResolvedValue([
      { chatId: "chat-1", username: "user1", firstName: "First" },
      { chatId: "chat-2", username: "user2", firstName: "Second" },
    ])

    await sendNotification("user-1", "Test Message")

    expect(mockFetch).toHaveBeenCalledTimes(2)
    const calls = mockFetch.mock.calls
    expect(calls[0][0]).toBe("https://api.telegram.org/bottoken-123/sendMessage")
    expect(JSON.parse(calls[0][1]?.body as string).chat_id).toBe("chat-1")
    expect(JSON.parse(calls[1][1]?.body as string).chat_id).toBe("chat-2")
  })

  it("filters telegram delivery by whitelist when whitelist is enabled", async () => {
    mockGetNotificationSettings.mockResolvedValue({
      telegramEnabled: true,
      discordEnabled: false,
      telegramBotToken: "token-123",
      discordWebhookUrl: null,
      telegramWhitelistEnabled: true,
      telegramWhitelist: "chat-1, @allowed_user, 12345",
    })

    mockGetTelegramChats.mockResolvedValue([
      { chatId: "chat-1", username: "user1", firstName: "First" }, // match strict chatId
      { chatId: "chat-2", username: "allowed_user", firstName: "Second" }, // match username (with @ stripped in whitelist)
      { chatId: "chat-3", username: "blocked_user", firstName: "Third" }, // no match
    ])

    await sendNotification("user-1", "Test Message")

    expect(mockFetch).toHaveBeenCalledTimes(2)
    const calls = mockFetch.mock.calls
    expect(JSON.parse(calls[0][1]?.body as string).chat_id).toBe("chat-1")
    expect(JSON.parse(calls[1][1]?.body as string).chat_id).toBe("chat-2")
  })
})
