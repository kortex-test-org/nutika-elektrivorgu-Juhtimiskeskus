"use client"

import type { CreateDeviceDto } from "@smartgrid/shared"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCreateDevice } from "@/hooks/useDevices"
import { DeviceForm } from "./DeviceForm"

export function AddDeviceModal() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const createMutation = useCreateDevice()

  const onSubmit = async (data: CreateDeviceDto) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        toast({ title: "Seade lisatud" })
        setOpen(false)
      },
      onError: (err) => toast({ title: "Viga", description: err.message, variant: "destructive" }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40">
          <Plus className="h-4 w-4" />
          Lisa seade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-white/10 bg-[#0f0f1a]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Lisa uus seade</DialogTitle>
        </DialogHeader>
        <DeviceForm mode="create" onSubmit={onSubmit} isLoading={createMutation.isPending} />
      </DialogContent>
    </Dialog>
  )
}
