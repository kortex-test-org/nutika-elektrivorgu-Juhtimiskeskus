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
    queryFn: () => api.get<{ price: PriceEntry }>("/api/prices/current").then((r) => r.price),
    refetchInterval: 60_000,
  })
}

export function useForecast() {
  return useQuery({
    queryKey: ["prices", "forecast"],
    queryFn: () =>
      api.get<{ forecast: PriceEntry[] }>("/api/prices/forecast").then((r) => r.forecast),
    staleTime: 5 * 60_000,
  })
}
