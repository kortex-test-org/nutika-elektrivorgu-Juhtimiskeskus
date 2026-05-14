"use client"

import type { UpdateDeviceDto } from "@smartgrid/shared"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { getDeviceStatus, StatusBadge } from "@/components/atoms/StatusBadge"
import { DeviceForm } from "@/components/organisms/DeviceForm"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useDeleteDevice, useDevice, useDeviceLogs, useUpdateDevice } from "@/hooks/useDevices"

export default function DeviceDetailPage() {
  const t = useTranslations("deviceDetail")
  const format = useFormatter()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { data: device, isLoading, error } = useDevice(id)
  const { data: logs } = useDeviceLogs(id)
  const updateMutation = useUpdateDevice(id)
  const deleteMutation = useDeleteDevice()

  const onSubmit = async (data: UpdateDeviceDto) => {
    await updateMutation.mutateAsync(data, {
      onSuccess: () => toast({ title: t("updateSuccess") }),
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  const handleDelete = () => {
    if (!device || !confirm(t("deleteConfirm", { name: device.name }))) return
    deleteMutation.mutate(device.id, {
      onSuccess: () => {
        toast({ title: t("deleteSuccess") })
        router.push("/devices")
      },
      onError: (err) =>
        toast({
          title: t("deleteError"),
          description: err.message,
          variant: "destructive",
        }),
    })
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="h-40 animate-pulse bg-muted rounded-lg" />
      </main>
    )
  }

  if (error || !device) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="text-destructive text-sm">{t("notFound")}</div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="ghost">
          <Link href="/devices">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1 w-fit heading-gradient">{device.name}</h1>
        <StatusBadge status={getDeviceStatus(device)} />
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">{t("tabSettings")}</TabsTrigger>
          <TabsTrigger value="logs">{t("tabLogs")}</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="mt-4">
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
              powerConsumption: device.powerConsumption
                ? Number(device.powerConsumption)
                : undefined,
              isCritical: device.isCritical,
            }}
            onSubmit={onSubmit}
            isLoading={updateMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("logCommand")}</TableHead>
                  <TableHead>{t("logTriggeredBy")}</TableHead>
                  <TableHead>{t("logPrice")}</TableHead>
                  <TableHead>{t("logTime")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!logs || logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      {t("logsEmpty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="uppercase font-mono text-xs">{log.command}</TableCell>
                      <TableCell className="text-xs">{log.triggeredBy}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.priceAtTime ? Number(log.priceAtTime).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format.dateTime(new Date(log.createdAt), {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
