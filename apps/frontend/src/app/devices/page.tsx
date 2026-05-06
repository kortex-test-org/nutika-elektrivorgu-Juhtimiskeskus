"use client"

import { Edit2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { getDeviceStatus, StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seadmed</h1>
        <Button asChild>
          <Link href="/devices/new">
            <Plus className="h-4 w-4 mr-2" />
            Lisa seade
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          Laadimine...
        </div>
      )}
      {error && (
        <div className="text-destructive text-sm">
          Seadmeid ei õnnestunud laadida: {error.message}
        </div>
      )}

      {devices && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nimi</TableHead>
                <TableHead>Tüüp</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Lävi (€/MWh)</TableHead>
                <TableHead>Olek</TableHead>
                <TableHead className="text-right">Tegevused</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Seadmeid pole lisatud
                  </TableCell>
                </TableRow>
              )}
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">
                    <Link href={`/devices/${device.id}`} className="hover:underline">
                      {device.name}
                    </Link>
                  </TableCell>
                  <TableCell className="uppercase text-xs">{device.connectionType}</TableCell>
                  <TableCell className="font-mono text-xs">{device.host}</TableCell>
                  <TableCell>
                    {device.threshold ? Number(device.threshold).toFixed(2) : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={getDeviceStatus(device)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/devices/${device.id}`}>
                          <Edit2 className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(device.id, device.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  )
}
