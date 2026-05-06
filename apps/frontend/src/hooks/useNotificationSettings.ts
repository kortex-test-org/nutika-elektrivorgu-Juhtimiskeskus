import type { NotificationSettingsDto } from "@smartgrid/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface NotificationSettings {
  channel: string | null
  telegramChatId: string | null
  discordWebhookUrl: string | null
  criticalPriceThreshold: string | null
  updatedAt: string
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["notifications", "settings"],
    queryFn: () => api.get<NotificationSettings>("/api/notifications/settings"),
  })
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: NotificationSettingsDto) =>
      api.put<NotificationSettings>("/api/notifications/settings", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}
