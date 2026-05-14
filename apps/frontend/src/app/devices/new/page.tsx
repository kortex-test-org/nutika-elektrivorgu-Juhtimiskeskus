"use client"

import type { CreateDeviceDto } from "@smartgrid/shared"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { DeviceForm } from "@/components/organisms/DeviceForm"
import { useToast } from "@/hooks/use-toast"
import { useCreateDevice } from "@/hooks/useDevices"

export default function NewDevicePage() {
  const t = useTranslations("devices")
  const router = useRouter()
  const { toast } = useToast()
  const createMutation = useCreateDevice()

  const onSubmit = async (data: CreateDeviceDto) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        toast({ title: t("addSuccess") })
        router.push("/devices")
      },
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 w-fit heading-gradient">{t("newTitle")}</h1>
      <DeviceForm mode="create" onSubmit={onSubmit} isLoading={createMutation.isPending} />
    </main>
  )
}
