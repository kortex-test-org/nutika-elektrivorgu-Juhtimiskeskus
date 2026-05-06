import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface PriceEntry {
  id: string
  timestamp: string
  priceEurMwh: string
  source: string
}

export function useCurrentPrice() {
  return useQuery({
    queryKey: ["prices", "current"],
    queryFn: () => api.get<PriceEntry>("/api/prices/current"),
    refetchInterval: 60_000,
  })
}

export function useForecast() {
  return useQuery({
    queryKey: ["prices", "forecast"],
    queryFn: () => api.get<PriceEntry[]>("/api/prices/forecast"),
    staleTime: 5 * 60_000,
  })
}
