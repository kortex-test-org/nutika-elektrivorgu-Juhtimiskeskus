"use client"

import type { CreateDeviceDto } from "@smartgrid/shared"
import { Plus } from "lucide-react"
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
import { useCreateDevice } from "@/hooks/useDevices"
import { DeviceForm } from "./DeviceForm"

export function AddDeviceModal() {
  const t = useTranslations("addDevice")
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const createMutation = useCreateDevice()

  const onSubmit = async (data: CreateDeviceDto) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        toast({ title: t("success") })
        setOpen(false)
      },
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40">
          <Plus className="h-4 w-4" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DeviceForm mode="create" onSubmit={onSubmit} isLoading={createMutation.isPending} />
      </DialogContent>
    </Dialog>
  )
}
