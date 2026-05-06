import type { SavingsConfigDto } from "@smartgrid/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface SavingsResult {
  totalSavingsEur: number
  period: string
  details: Array<{
    timestamp: string
    exchangePriceEurKwh: number
    fixedRateEurKwh: number
    savingsEurKwh: number
  }>
}

interface SavingsConfig {
  fixedRateEurKwh: string
  updatedAt: string
}

export function useSavings(period: "day" | "week" | "month") {
  return useQuery({
    queryKey: ["savings", period],
    queryFn: () => api.get<SavingsResult>(`/api/savings?period=${period}`),
  })
}

export function useSavingsConfig() {
  return useQuery({
    queryKey: ["savings", "config"],
    queryFn: () => api.get<{ config: SavingsConfig }>("/api/savings/config").then((r) => r.config),
  })
}

export function useUpdateSavingsConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SavingsConfigDto) => api.put<SavingsConfig>("/api/savings/config", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings"] })
    },
  })
}
