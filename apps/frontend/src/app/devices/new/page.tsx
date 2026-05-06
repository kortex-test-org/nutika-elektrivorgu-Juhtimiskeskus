"use client"

import type { CreateDeviceDto } from "@smartgrid/shared"
import { useRouter } from "next/navigation"
import { DeviceForm } from "@/components/organisms/DeviceForm"
import { useToast } from "@/hooks/use-toast"
import { useCreateDevice } from "@/hooks/useDevices"

export default function NewDevicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const createMutation = useCreateDevice()

  const onSubmit = async (data: CreateDeviceDto) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        toast({ title: "Seade lisatud" })
        router.push("/devices")
      },
      onError: (err) => toast({ title: "Viga", description: err.message, variant: "destructive" }),
    })
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 w-fit bg-linear-to-r from-foreground to-violet-500 bg-clip-text text-transparent">
        Lisa uus seade
      </h1>
      <DeviceForm mode="create" onSubmit={onSubmit} isLoading={createMutation.isPending} />
    </main>
  )
}
