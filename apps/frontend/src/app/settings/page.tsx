"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { NotificationSettingsDto } from "@smartgrid/shared"
import { NotificationSettingsSchema } from "@smartgrid/shared"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/useNotificationSettings"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"

function CredentialsCard() {
  const t = useTranslations("settings")
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: user?.username ?? "",
      password: "",
    },
  })

  const onSubmit = async (data: { username: string; password?: string }) => {
    try {
      const payload: Record<string, string> = { username: data.username }
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password
      }

      const response = await api.patch<{
        user: { id: string; username: string; role: "master" | "user" }
      }>("/api/auth/me", payload)

      if (user) {
        setUser({ ...user, username: response.user.username })
      }

      toast({ title: t("credentialsSaved") })
      reset({ username: response.user.username, password: "" })
    } catch (err) {
      toast({
        title: t("error"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("changeCredentials")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">{t("username")}</Label>
            <Input id="username" {...register("username", { required: true })} />
            {errors.username && (
              <span className="text-destructive text-xs">{t("fieldRequired")}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("newPasswordPlaceholder")}
              {...register("password", { minLength: 8 })}
            />
            {errors.password && (
              <span className="text-destructive text-xs">{t("passwordMinLength")}</span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("saveCredentials")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

import { AlertCircle, Bot, Info, Plus, UserCheck, X } from "lucide-react"

export interface TelegramChat {
  id: string
  chatId: string
  username: string | null
  firstName: string | null
  createdAt: string
}

export default function SettingsPage() {
  const t = useTranslations("settings")
  const { data, isLoading } = useNotificationSettings()
  const settings = data?.settings
  const telegramChats = (data?.telegramChats || []) as TelegramChat[]
  const updateMutation = useUpdateNotificationSettings()
  const { toast } = useToast()

  const [newEntry, setNewEntry] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<NotificationSettingsDto>({
    resolver: typeboxResolver(NotificationSettingsSchema),
    values: settings
      ? {
          telegramEnabled: settings.telegramEnabled,
          discordEnabled: settings.discordEnabled,
          telegramBotToken: settings.telegramBotToken ?? undefined,
          discordWebhookUrl: settings.discordWebhookUrl ?? undefined,
          telegramWhitelistEnabled: settings.telegramWhitelistEnabled,
          telegramWhitelist: settings.telegramWhitelist ?? undefined,
          criticalPriceThreshold: settings.criticalPriceThreshold
            ? Number(settings.criticalPriceThreshold)
            : undefined,
        }
      : undefined,
  })

  const telegramEnabled = watch("telegramEnabled")
  const discordEnabled = watch("discordEnabled")
  const telegramWhitelist = watch("telegramWhitelist") || ""
  const telegramWhitelistEnabled = watch("telegramWhitelistEnabled")

  const whitelistEntries = telegramWhitelist
    ? telegramWhitelist
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : []

  const isSubscriberAllowed = (chat: TelegramChat) => {
    if (!telegramWhitelistEnabled) return true
    const entries = whitelistEntries.map((e) => e.trim().toLowerCase().replace(/^@/, ""))
    const chatIdLower = chat.chatId.toLowerCase()
    const usernameLower = chat.username ? chat.username.toLowerCase().replace(/^@/, "") : ""

    return (
      entries.includes(chatIdLower) || (usernameLower ? entries.includes(usernameLower) : false)
    )
  }

  const handleToggleSubscriber = (chat: TelegramChat) => {
    const chatIdLower = chat.chatId.toLowerCase()
    const usernameLower = chat.username ? chat.username.toLowerCase().replace(/^@/, "") : ""

    let updated: string[]
    const allowed = isSubscriberAllowed(chat)

    if (allowed) {
      updated = whitelistEntries.filter((entry) => {
        const norm = entry.trim().toLowerCase().replace(/^@/, "")
        return norm !== chatIdLower && norm !== usernameLower
      })
    } else {
      const identifier = chat.username ? `@${chat.username}` : chat.chatId
      updated = [...whitelistEntries, identifier]
    }

    const val = updated.join(", ")
    setValue("telegramWhitelist", val)
    handleSubmit(onSubmit)()
  }

  const handleAddWhitelistEntry = (entryToAdd: string) => {
    const trimmed = entryToAdd.trim()
    if (!trimmed) return

    const normalized = trimmed.toLowerCase().replace(/^@/, "")
    const exists = whitelistEntries.some(
      (entry) => entry.toLowerCase().replace(/^@/, "") === normalized,
    )
    if (exists) {
      setNewEntry("")
      return
    }

    const updated = [...whitelistEntries, trimmed]
    setValue("telegramWhitelist", updated.join(", "))
    setNewEntry("")
    handleSubmit(onSubmit)()
  }

  const handleRemoveWhitelistEntry = (entryToRemove: string) => {
    const updatedEntries = whitelistEntries.filter((entry) => entry !== entryToRemove)
    const newVal = updatedEntries.length > 0 ? updatedEntries.join(", ") : ""
    setValue("telegramWhitelist", newVal)
    handleSubmit(onSubmit)()
  }

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

      <CredentialsCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5 text-violet-500" />
            {t("notifications")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Telegram Settings Section */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-muted bg-muted/20">
              <div className="flex items-center gap-3">
                <input
                  id="telegramEnabled"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                  {...register("telegramEnabled")}
                />
                <Label
                  htmlFor="telegramEnabled"
                  className="font-semibold text-sm cursor-pointer select-none"
                >
                  {t("enableTelegram")}
                </Label>
              </div>

              {telegramEnabled && (
                <div className="flex flex-col gap-4 mt-2 pl-6 border-l-2 border-violet-500/20 animate-in slide-in-from-left-2 duration-200">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="telegramBotToken">{t("telegramBotToken")}</Label>
                    <Input
                      id="telegramBotToken"
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      {...register("telegramBotToken")}
                    />
                    <span className="text-xs text-muted-foreground">{t("telegramTokenHint")}</span>
                  </div>

                  {/* Telegram Whitelist Section */}
                  <div className="flex flex-col gap-3 pt-3 border-t border-muted/50">
                    <div className="flex items-center gap-3">
                      <input
                        id="telegramWhitelistEnabled"
                        type="checkbox"
                        className="h-4 w-4 rounded border-input text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                        {...register("telegramWhitelistEnabled")}
                      />
                      <Label
                        htmlFor="telegramWhitelistEnabled"
                        className="font-semibold text-sm cursor-pointer select-none"
                      >
                        {t("enableTelegramWhitelist")}
                      </Label>
                    </div>

                    {telegramWhitelistEnabled && (
                      <div className="flex flex-col gap-3 mt-1 animate-in slide-in-from-top-2 duration-200">
                        {/* Whitelist Tags */}
                        <div className="flex flex-wrap gap-1.5 p-2 min-h-[40px] rounded-lg border bg-background/50">
                          {whitelistEntries.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic px-1.5 py-1">
                              {t("telegramWhitelistHint")}
                            </span>
                          ) : (
                            whitelistEntries.map((entry) => (
                              <span
                                key={entry}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"
                              >
                                {/^-?\d+$/.test(entry)
                                  ? entry
                                  : entry.startsWith("@")
                                    ? entry
                                    : `@${entry}`}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWhitelistEntry(entry)}
                                  className="text-violet-400 hover:text-violet-600 hover:bg-violet-500/20 rounded-full p-0.5 transition-colors focus:outline-none"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Manual entry */}
                        <div className="flex gap-2">
                          <Input
                            placeholder={t("whitelistAddPlaceholder")}
                            value={newEntry}
                            onChange={(e) => setNewEntry(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddWhitelistEntry(newEntry)
                              }
                            }}
                            className="text-xs h-9"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddWhitelistEntry(newEntry)}
                            className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 h-9"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {t("whitelistAddButton")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Subscribers List */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-green-500" />
                      {t("activeSubscribers")} ({telegramChats.length})
                    </span>

                    {telegramChats.length === 0 ? (
                      <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-dashed flex items-center gap-2">
                        <Info className="h-4 w-4 text-violet-400 shrink-0" />
                        <span>{t("noSubscribers")}</span>
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-background">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b bg-muted/50 text-muted-foreground font-medium">
                              <th className="p-2">{t("subscriberName")}</th>
                              <th className="p-2">{t("subscriberChatId")}</th>
                              {telegramWhitelistEnabled && (
                                <th className="p-2 text-right">Access</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {telegramChats.map((chat) => {
                              const allowed = isSubscriberAllowed(chat)
                              return (
                                <tr
                                  key={chat.id}
                                  className="border-b last:border-0 hover:bg-muted/30 align-middle"
                                >
                                  <td className="p-2 font-medium">
                                    {chat.firstName || ""}{" "}
                                    {chat.username ? (
                                      <span className="text-violet-500 font-normal">
                                        @{chat.username}
                                      </span>
                                    ) : (
                                      ""
                                    )}
                                  </td>
                                  <td className="p-2 text-muted-foreground">{chat.chatId}</td>
                                  {telegramWhitelistEnabled && (
                                    <td className="p-2 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-2">
                                        {allowed ? (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                                            {t("whitelistAllowed")}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                                            {t("whitelistBlocked")}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleSubscriber(chat)}
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all focus:outline-none ${
                                            allowed
                                              ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                              : "bg-violet-600 text-white hover:bg-violet-700"
                                          }`}
                                        >
                                          {allowed
                                            ? t("whitelistRemoveAction")
                                            : t("whitelistAddAction")}
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="bg-violet-500/5 border border-violet-500/10 rounded-lg p-3 text-xs text-muted-foreground flex flex-col gap-1.5">
                    <span className="font-semibold text-violet-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {t("telegramInstructionsTitle")}
                    </span>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>{t("telegramStep1")}</li>
                      <li>{t("telegramStep2")}</li>
                      <li>{t("telegramStep3")}</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Discord Settings Section */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-muted bg-muted/20">
              <div className="flex items-center gap-3">
                <input
                  id="discordEnabled"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                  {...register("discordEnabled")}
                />
                <Label
                  htmlFor="discordEnabled"
                  className="font-semibold text-sm cursor-pointer select-none"
                >
                  {t("enableDiscord")}
                </Label>
              </div>

              {discordEnabled && (
                <div className="flex flex-col gap-4 mt-2 pl-6 border-l-2 border-violet-500/20 animate-in slide-in-from-left-2 duration-200">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="discordWebhookUrl">Discord Webhook URL</Label>
                    <Input
                      id="discordWebhookUrl"
                      type="url"
                      placeholder="https://discord.com/api/webhooks/..."
                      {...register("discordWebhookUrl")}
                    />
                    <span className="text-xs text-muted-foreground">{t("discordWebhookHint")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Threshold settings */}
            <div className="flex flex-col gap-1.5 border-t pt-4">
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
              {updateMutation.isPending || isSubmitting ? t("saving") : t("saveSettings")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
