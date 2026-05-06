"use client"

import { AlertTriangle, Edit2, Server, Trash2, Zap } from "lucide-react"
import Link from "next/link"
import { getDeviceStatus, StatusBadge } from "@/components/atoms/StatusBadge"
import { AddDeviceModal } from "@/components/organisms/AddDeviceModal"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useDeleteDevice, useDevices } from "@/hooks/useDevices"

export default function DevicesPage() {
  const { data: devices, isLoading, error } = useDevices()
  const deleteMutation = useDeleteDevice()
  const { toast } = useToast()

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Kustuta seade "${name}"?`)) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: "Seade kustutatud" }),
      onError: (err) =>
        toast({
          title: "Kustutamine ebaõnnestus",
          description: err.message,
          variant: "destructive",
        }),
    })
  }

  const total = devices?.length ?? 0
  const online = devices?.filter((d) => d.currentState === true).length ?? 0
  const critical = devices?.filter((d) => d.isCritical).length ?? 0

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold w-fit bg-linear-to-r from-foreground to-violet-500 bg-clip-text text-transparent">
              Seadmed
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Halda ühendatud seadmeid</p>
          </div>
          <AddDeviceModal />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 animate-fade-up [animation-delay:80ms]">
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <div className="rounded-lg bg-violet-600/20 p-2">
              <Server className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Kokku seadmeid</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <div className="rounded-lg bg-emerald-600/20 p-2">
              <Zap className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{online}</p>
              <p className="text-xs text-muted-foreground">Sees</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
            <div className="rounded-lg bg-rose-600/20 p-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{critical}</p>
              <p className="text-xs text-muted-foreground">Kriitilised</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-2">
            {([1, 2, 3] as const).map((k) => (
              <div key={k} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-400 text-sm">
            Seadmeid ei õnnestunud laadida: {error.message}
          </div>
        )}

        {/* Devices list */}
        {devices && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden animate-fade-up [animation-delay:160ms]">
            {/* Table head */}
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Nimi</span>
              <span>Tüüp</span>
              <span>Host</span>
              <span>Lävi</span>
              <span>Olek</span>
              <span className="text-right">Tegevused</span>
            </div>

            {devices.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                <Server className="h-10 w-10 opacity-30" />
                <p className="font-medium">Seadmeid pole lisatud</p>
                <p className="text-sm">Alusta esimese seadme lisamisega</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/devices/${device.id}`}
                        className="font-medium text-foreground hover:text-violet-500 transition-colors text-sm"
                      >
                        {device.name}
                      </Link>
                      {device.description && (
                        <span className="text-xs text-muted-foreground">{device.description}</span>
                      )}
                      {device.isCritical && (
                        <span className="text-xs text-rose-400 font-medium">⚠ Kriitiline</span>
                      )}
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-violet-600 dark:text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-md px-2 py-0.5 w-fit">
                      {device.connectionType}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{device.host}</span>
                    <span className="text-sm text-muted-foreground">
                      {device.threshold ? `${Number(device.threshold).toFixed(2)}` : "—"}
                    </span>
                    <StatusBadge status={getDeviceStatus(device)} />
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 border-border bg-muted hover:bg-muted/80 hover:border-violet-500/50"
                      >
                        <Link href={`/devices/${device.id}`}>
                          <Edit2 className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 w-7 p-0 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/20 text-rose-400"
                        onClick={() => handleDelete(device.id, device.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
