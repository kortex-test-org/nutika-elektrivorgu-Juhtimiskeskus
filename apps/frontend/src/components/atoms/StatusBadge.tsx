import { Badge } from "@/components/ui/badge"

type DeviceStatus = "on" | "off" | "override" | "disconnected"

interface StatusBadgeProps {
  status: DeviceStatus
}

const STATUS_CONFIG: Record<
  DeviceStatus,
  { label: string; variant: "success" | "outline" | "warning" | "destructive" }
> = {
  on: { label: "Sees", variant: "success" },
  off: { label: "Väljas", variant: "outline" },
  override: { label: "Ülekiri", variant: "warning" },
  disconnected: { label: "Ühenduseta", variant: "destructive" },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function getDeviceStatus(device: {
  currentState: boolean | null
  overrideActive: boolean
}): DeviceStatus {
  if (device.overrideActive) return "override"
  if (device.currentState === null) return "disconnected"
  return device.currentState ? "on" : "off"
}
