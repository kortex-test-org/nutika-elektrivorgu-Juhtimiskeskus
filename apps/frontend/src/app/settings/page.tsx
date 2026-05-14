"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { NotificationSettingsDto } from "@smartgrid/shared"
import { NotificationSettingsSchema } from "@smartgrid/shared"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/useNotificationSettings"

export default function SettingsPage() {
  const t = useTranslations("settings")
  const { data: settings, isLoading } = useNotificationSettings()
  const updateMutation = useUpdateNotificationSettings()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NotificationSettingsDto>({
    resolver: typeboxResolver(NotificationSettingsSchema),
    values: settings
      ? {
          channel: settings.channel as "telegram" | "discord" | null | undefined,
          telegramChatId: settings.telegramChatId ?? undefined,
          discordWebhookUrl: settings.discordWebhookUrl ?? undefined,
          criticalPriceThreshold: settings.criticalPriceThreshold
            ? Number(settings.criticalPriceThreshold)
            : undefined,
        }
      : undefined,
  })

  const channel = watch("channel")

  const onSubmit = async (data: NotificationSettingsDto) => {
    await updateMutation.mutateAsync(data, {
      onSuccess: () => toast({ title: t("saved") }),
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="h-60 animate-pulse bg-muted rounded-lg" />
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold w-fit heading-gradient">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("notifications")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t("channel")}</Label>
              <Select
                defaultValue={settings?.channel ?? undefined}
                onValueChange={(v) =>
                  setValue("channel", v === "none" ? null : (v as "telegram" | "discord"))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectChannel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("disabled")}</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {channel === "telegram" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                <Input
                  id="telegramChatId"
                  placeholder="-100123456789"
                  {...register("telegramChatId")}
                />
                {errors.telegramChatId && (
                  <span className="text-destructive text-xs">
                    {errors.telegramChatId.message as string}
                  </span>
                )}
              </div>
            )}

            {channel === "discord" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="discordWebhookUrl">Discord Webhook URL</Label>
                <Input
                  id="discordWebhookUrl"
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  {...register("discordWebhookUrl")}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="threshold">{t("criticalThreshold")}</Label>
              <Input
                id="threshold"
                type="number"
                step="0.01"
                placeholder="150"
                {...register("criticalPriceThreshold", { valueAsNumber: true })}
              />
              <span className="text-xs text-muted-foreground">{t("criticalThresholdHint")}</span>
            </div>

            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              {t("saveSettings")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
