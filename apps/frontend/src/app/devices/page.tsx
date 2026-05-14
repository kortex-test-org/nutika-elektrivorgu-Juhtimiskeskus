"use client"

import { AlertTriangle, Edit2, Plane, Power, Server, Trash2, Zap } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getDeviceStatus, StatusBadge } from "@/components/atoms/StatusBadge"
import { AddDeviceModal } from "@/components/organisms/AddDeviceModal"
import { EditDeviceModal } from "@/components/organisms/EditDeviceModal"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useDeleteDevice, useDevices, useOverrideDevice, useToggleDevice } from "@/hooks/useDevices"
import { cn } from "@/lib/utils"

import { useSettingsStore } from "@/stores/settingsStore"

export default function DevicesPage() {
  const t = useTranslations("devices")
  const { data: devices, isLoading, error } = useDevices()
  const deleteMutation = useDeleteDevice()
  const toggleMutation = useToggleDevice()
  const overrideMutation = useOverrideDevice()
  const { toast } = useToast()
  const { isVacationMode, vacationDeviceIds, setVacationMode } = useSettingsStore()

  const handleDelete = (id: string, name: string) => {
    if (!confirm(t("deleteConfirm", { name }))) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: t("deleteSuccess") }),
      onError: (err) =>
        toast({
          title: t("deleteError"),
          description: err.message,
          variant: "destructive",
        }),
    })
  }

  const total = devices?.length ?? 0
  const online =
    devices?.filter((d) => (d.overrideActive ? d.overrideState : d.currentState) === true).length ??
    0
  const critical = devices?.filter((d) => d.isCritical).length ?? 0

  const handleVacationMode = async () => {
    if (!devices) return

    if (!isVacationMode) {
      // Enabling Vacation Mode: turn off non-critical ON devices
      const toDisable = devices.filter((d) => !d.isCritical && d.currentState === true)
      if (toDisable.length === 0) {
        setVacationMode(true, [])
        toast({ title: t("vacationMode") })
        return
      }

      try {
        const ids = toDisable.map((d) => d.id)
        await Promise.all(
          toDisable.map((d) => toggleMutation.mutateAsync({ id: d.id, data: { state: false } })),
        )
        setVacationMode(true, ids)
        toast({ title: t("vacationMode"), description: t("vacationModeHint") })
      } catch (err) {
        toast({
          title: t("error"),
          description: "Failed to enable vacation mode",
          variant: "destructive",
        })
      }
    } else {
      // Disabling Vacation Mode: turn back on previously disabled devices
      if (vacationDeviceIds.length === 0) {
        setVacationMode(false)
        toast({ title: t("vacationMode") + " OFF" })
        return
      }

      try {
        await Promise.all(
          vacationDeviceIds.map((id) => toggleMutation.mutateAsync({ id, data: { state: true } })),
        )
        setVacationMode(false)
        toast({ title: t("vacationMode") + " OFF" })
      } catch (err) {
        toast({
          title: t("error"),
          description: "Failed to disable vacation mode",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold w-fit heading-gradient">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isVacationMode ? "default" : "outline"}
              size="sm"
              className={cn(
                "gap-2 transition-all",
                isVacationMode
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-900/20"
                  : "border-amber-500/50 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400",
              )}
              onClick={handleVacationMode}
              disabled={toggleMutation.isPending}
            >
              <Plane className="h-4 w-4" />
              {t("vacationMode")}
            </Button>
            <AddDeviceModal />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(12rem,100%),1fr))] gap-4 animate-fade-up [animation-delay:80ms]">
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <div className="rounded-lg bg-violet-600/20 p-2">
              <Server className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">{t("total")}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <div className="rounded-lg bg-emerald-600/20 p-2">
              <Zap className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{online}</p>
              <p className="text-xs text-muted-foreground">{t("online")}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <div className="rounded-lg bg-rose-600/20 p-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{critical}</p>
              <p className="text-xs text-muted-foreground">{t("critical")}</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-2">
            {([1, 2, 3] as const).map((k) => (
              <div key={k} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-400 text-sm">
            {t("loadError")}: {error.message}
          </div>
        )}

        {/* Devices list */}
        {devices && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden animate-fade-up [animation-delay:160ms]">
            {/* Table head */}
            <div className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr_auto] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>{t("name")}</span>
              <span>Host</span>
              <span>{t("threshold")}</span>
              <span className="text-center">{t("status")}</span>
              <span className="text-center">{t("mode")}</span>
              <span className="text-right">{t("actions")}</span>
            </div>

            {devices.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                <Server className="h-10 w-10 opacity-30" />
                <p className="font-medium">{t("empty")}</p>
                <p className="text-sm">{t("emptyHint")}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground text-sm cursor-default">
                        {device.name}
                      </span>
                      {device.description && (
                        <span className="text-xs text-muted-foreground">{device.description}</span>
                      )}
                      {device.isCritical && (
                        <span className="text-xs text-rose-400 font-medium">
                          {t("criticalLabel")}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {device.host || "—"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {device.threshold ? `${Number(device.threshold).toFixed(2)}` : "—"}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant={
                          (device.overrideActive ? device.overrideState : device.currentState)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "h-8 w-8 p-0 rounded-full transition-all",
                          (device.overrideActive ? device.overrideState : device.currentState)
                            ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
                            : "hover:border-emerald-500/50 hover:text-emerald-500",
                        )}
                        onClick={() => {
                          if (isVacationMode) return
                          toggleMutation.mutate({
                            id: device.id,
                            data: {
                              state: !(device.overrideActive
                                ? device.overrideState
                                : device.currentState),
                            },
                          })
                        }}
                        disabled={toggleMutation.isPending || isVacationMode}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-center">
                      {device.overrideActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (isVacationMode) return
                            overrideMutation.mutate({
                              id: device.id,
                              data: { active: false },
                            })
                          }}
                          className={cn(
                            "transition-transform hover:scale-105 active:scale-95",
                            isVacationMode ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                          )}
                          title="Switch to Auto"
                          disabled={isVacationMode}
                        >
                          <StatusBadge status="override" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (isVacationMode) return
                            overrideMutation.mutate({
                              id: device.id,
                              data: { active: true, state: device.currentState ?? false },
                            })
                          }}
                          className={cn(
                            "transition-transform hover:scale-105 active:scale-95",
                            isVacationMode ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                          )}
                          title="Switch to Manual"
                          disabled={isVacationMode}
                        >
                          <StatusBadge status="auto" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditDeviceModal device={device as any} />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 w-7 p-0 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/20 text-rose-400"
                        onClick={() => handleDelete(device.id, device.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
