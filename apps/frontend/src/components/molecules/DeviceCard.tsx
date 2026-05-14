"use client"

import { Power } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getDeviceStatus, StatusBadge } from "@/components/atoms/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useToggleDevice } from "@/hooks/useDevices"
import { useSettingsStore } from "@/stores/settingsStore"

interface Device {
  id: string
  name: string
  description: string | null
  threshold: string | null
  powerConsumption: string | null
  isCritical: boolean
  overrideActive: boolean
  overrideState: boolean | null
  currentState: boolean | null
}

interface DeviceCardProps {
  device: Device
}

export function DeviceCard({ device }: DeviceCardProps) {
  const t = useTranslations("deviceCard")
  const { toast } = useToast()
  const toggleMutation = useToggleDevice()
  const { isVacationMode } = useSettingsStore()

  const status = getDeviceStatus(device)

  const handleToggle = () => {
    if (isVacationMode) return

    const newState = !device.currentState
    toggleMutation.mutate(
      { id: device.id, data: { state: newState } },
      {
        onError: (err) =>
          toast({ title: t("toggleError"), description: err.message, variant: "destructive" }),
      },
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-semibold">
            <Link href={`/devices/${device.id}`} className="hover:underline">
              {device.name}
            </Link>
          </CardTitle>
          {device.description && (
            <span className="text-xs text-muted-foreground">{device.description}</span>
          )}
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {device.threshold && (
            <div className="text-xs text-muted-foreground">
              {t("threshold")}:{" "}
              <span className="font-mono">{Number(device.threshold).toFixed(2)} €/MWh</span>
            </div>
          )}
        </div>
        {device.isCritical && (
          <div className="flex">
            <Badge
              variant="warning_dark"
              className="text-[10px] px-1.5 py-0 uppercase tracking-wider"
            >
              {t("critical").replace("⚠ ", "")}
            </Badge>
          </div>
        )}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant={device.currentState ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={toggleMutation.isPending || isVacationMode}
            className="flex-1"
          >
            <Power className="h-3 w-3 mr-1" />
            {device.currentState ? t("turnOff") : t("turnOn")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
