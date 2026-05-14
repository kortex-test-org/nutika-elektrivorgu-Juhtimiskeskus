import type { CreateDeviceDto, OverrideDto, ToggleDto, UpdateDeviceDto } from "@smartgrid/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Device {
  id: string
  userId: string
  name: string
  description: string | null
  connectionType: string
  host: string | null
  port: number | null
  topic: string | null
  threshold: string | null
  powerConsumption: string | null
  isCritical: boolean
  overrideActive: boolean
  overrideState: boolean | null
  currentState: boolean | null
  createdAt: string
}

interface DeviceLog {
  id: string
  deviceId: string
  command: string
  triggeredBy: string
  priceAtTime: string | null
  createdAt: string
}

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get<{ devices: Device[] }>("/api/devices").then((r) => r.devices),
  })
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ["devices", id],
    queryFn: () => api.get<{ device: Device }>(`/api/devices/${id}`).then((r) => r.device),
    enabled: Boolean(id),
  })
}

export function useDeviceLogs(id: string, page = 1) {
  return useQuery({
    queryKey: ["devices", id, "logs", page],
    queryFn: () =>
      api.get<{ logs: DeviceLog[] }>(`/api/devices/${id}/logs?page=${page}`).then((r) => r.logs),
    enabled: Boolean(id),
  })
}

export function useCreateDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDeviceDto) => api.post<Device>("/api/devices", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  })
}

export function useUpdateDevice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateDeviceDto) => api.patch<Device>(`/api/devices/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  })
}

export function useDeleteDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/devices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  })
}

export function useToggleDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleDto }) =>
      api.post<{ success: boolean }>(`/api/devices/${id}/toggle`, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["devices"] })
      const prev = qc.getQueryData<Device[]>(["devices"])
      qc.setQueryData<Device[]>(["devices"], (old) =>
        old?.map((d) => (d.id === id ? { ...d, currentState: data.state } : d)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["devices"], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  })
}

export function useOverrideDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OverrideDto }) =>
      api.post<{ success: boolean }>(`/api/devices/${id}/override`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  })
}
