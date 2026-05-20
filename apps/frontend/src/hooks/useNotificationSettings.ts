import type { NotificationSettingsDto } from "@smartgrid/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface NotificationSettings {
  telegramEnabled: boolean
  discordEnabled: boolean
  telegramBotToken: string | null
  discordWebhookUrl: string | null
  telegramWhitelistEnabled: boolean
  telegramWhitelist: string | null
  criticalPriceThreshold: string | null
  updatedAt: string
}

export interface TelegramChat {
  id: string
  chatId: string
  username: string | null
  firstName: string | null
  createdAt: string
}

export interface NotificationSettingsResponse {
  settings: NotificationSettings
  telegramChats: TelegramChat[]
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["notifications", "settings"],
    queryFn: () => api.get<NotificationSettingsResponse>("/api/notifications/settings"),
  })
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: NotificationSettingsDto) =>
      api.put<NotificationSettingsResponse>("/api/notifications/settings", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}
