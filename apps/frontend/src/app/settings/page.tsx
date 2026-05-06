"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { NotificationSettingsDto } from "@smartgrid/shared"
import { NotificationSettingsSchema } from "@smartgrid/shared"
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
      onSuccess: () => toast({ title: "Seaded salvestatud" }),
      onError: (err) => toast({ title: "Viga", description: err.message, variant: "destructive" }),
    })
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="h-60 animate-pulse bg-muted rounded-lg" />
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg flex flex-col gap-8">
      <h1 className="text-2xl font-bold bg-linear-to-r from-foreground to-violet-500 bg-clip-text text-transparent">
        Seaded
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teavitused</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Kanal</Label>
              <Select
                defaultValue={settings?.channel ?? undefined}
                onValueChange={(v) =>
                  setValue("channel", v === "none" ? null : (v as "telegram" | "discord"))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vali kanal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keelatud</SelectItem>
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
              <Label htmlFor="threshold">Kriitiline hinnalävi (EUR/MWh, valikuline)</Label>
              <Input
                id="threshold"
                type="number"
                step="0.01"
                placeholder="150"
                {...register("criticalPriceThreshold", { valueAsNumber: true })}
              />
              <span className="text-xs text-muted-foreground">
                Teavitus saadetakse, kui börsihind ületab selle läve
              </span>
            </div>

            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              Salvesta seaded
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
