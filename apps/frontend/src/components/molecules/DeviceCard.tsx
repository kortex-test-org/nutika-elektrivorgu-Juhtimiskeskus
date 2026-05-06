"use client"

import { Power, Shield } from "lucide-react"
import Link from "next/link"
import { getDeviceStatus, StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useOverrideDevice, useToggleDevice } from "@/hooks/useDevices"

interface Device {
  id: string
  name: string
  description: string | null
  threshold: string | null
  isCritical: boolean
  overrideActive: boolean
  overrideState: boolean | null
  currentState: boolean | null
}

interface DeviceCardProps {
  device: Device
}

export function DeviceCard({ device }: DeviceCardProps) {
  const { toast } = useToast()
  const toggleMutation = useToggleDevice()
  const overrideMutation = useOverrideDevice()

  const status = getDeviceStatus(device)

  const handleToggle = () => {
    const newState = !device.currentState
    toggleMutation.mutate(
      { id: device.id, data: { state: newState } },
      {
        onError: (err) =>
          toast({ title: "Viga lülitamisel", description: err.message, variant: "destructive" }),
      },
    )
  }

  const handleOverride = () => {
    overrideMutation.mutate(
      {
        id: device.id,
        data: { active: !device.overrideActive, state: device.currentState ?? false },
      },
      {
        onError: (err) =>
          toast({
            title: "Viga ülekirjutamisel",
            description: err.message,
            variant: "destructive",
          }),
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
      <CardContent className="flex flex-col gap-3">
        {device.threshold && (
          <div className="text-xs text-muted-foreground">
            Lävi:{" "}
            <span className="font-mono">{(Number(device.threshold) / 1000).toFixed(4)} €/kWh</span>
          </div>
        )}
        {device.isCritical && (
          <div className="text-xs text-red-600 font-medium">⚠ Kriitiline seade</div>
        )}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant={device.currentState ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={toggleMutation.isPending || device.overrideActive}
            className="flex-1"
          >
            <Power className="h-3 w-3 mr-1" />
            {device.currentState ? "Lülita välja" : "Lülita sisse"}
          </Button>
          <Button
            size="sm"
            variant={device.overrideActive ? "secondary" : "outline"}
            onClick={handleOverride}
            disabled={overrideMutation.isPending}
          >
            <Shield className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
