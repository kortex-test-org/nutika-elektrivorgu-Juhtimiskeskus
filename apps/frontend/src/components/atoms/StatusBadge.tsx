"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"

type DeviceStatus = "on" | "off" | "override" | "auto" | "disconnected"

interface StatusBadgeProps {
  status: DeviceStatus
}

const STATUS_VARIANT: Record<
  DeviceStatus,
  "success" | "outline" | "warning" | "default" | "destructive"
> = {
  on: "success",
  off: "outline",
  override: "warning",
  auto: "default",
  disconnected: "destructive",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations("status")
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>
}

export function getDeviceStatus(device: {
  currentState: boolean | null
  overrideActive: boolean
}): DeviceStatus {
  if (device.overrideActive) return "override"
  if (device.currentState === null) return "disconnected"
  return device.currentState ? "on" : "off"
}
