"use client"

import type { UpdateDeviceDto } from "@smartgrid/shared"
import { Edit2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useUpdateDevice } from "@/hooks/useDevices"
import { DeviceForm } from "./DeviceForm"

interface Device {
  id: string
  name: string
  description: string | null
  connectionType: string
  host: string | null
  port: number | null
  topic: string | null
  threshold: string | null
  powerConsumption: string | null
  isCritical: boolean
}

interface EditDeviceModalProps {
  device: Device
}

export function EditDeviceModal({ device }: EditDeviceModalProps) {
  const tDetail = useTranslations("deviceDetail")
  const tDevices = useTranslations("devices")
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const updateMutation = useUpdateDevice(device.id)

  const onSubmit = async (data: UpdateDeviceDto) => {
    await updateMutation.mutateAsync(data, {
      onSuccess: () => {
        toast({ title: tDetail("updateSuccess") })
        setOpen(false)
      },
      onError: (err) =>
        toast({ title: tDetail("error"), description: err.message, variant: "destructive" }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 border-border bg-muted hover:bg-muted/80 hover:border-violet-500/50"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{device.name}</DialogTitle>
          <DialogDescription>{tDetail("tabSettings")}</DialogDescription>
        </DialogHeader>
        <DeviceForm
          mode="edit"
          defaultValues={{
            name: device.name,
            description: device.description ?? undefined,
            connectionType: device.connectionType as "http" | "mqtt" | "mock",
            host: device.host ?? undefined,
            port: device.port ?? undefined,
            topic: device.topic ?? undefined,
            threshold: device.threshold ? Number(device.threshold) : undefined,
            powerConsumption: device.powerConsumption ? Number(device.powerConsumption) : undefined,
            isCritical: device.isCritical,
          }}
          onSubmit={onSubmit}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
