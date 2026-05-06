"use client"

import { BarChart3 } from "lucide-react"
import { PriceIndicator } from "@/components/atoms/PriceIndicator"
import { ForecastChart } from "@/components/organisms/ForecastChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useForecast } from "@/hooks/usePrices"

export default function ForecastPage() {
  const { data: forecast, isLoading, error } = useForecast()

  const cheapest = forecast
    ?.slice()
    .sort((a, b) => Number(a.priceEurMwh) - Number(b.priceEurMwh))
    .slice(0, 3)

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold animate-fade-up">Hinnprognoos</h1>

      {isLoading && <div className="h-64 animate-pulse bg-muted rounded-xl" />}
      {error && (
        <div className="text-destructive text-sm">
          Prognoosi ei õnnestunud laadida: {error.message}
        </div>
      )}

      {!isLoading && !error && forecast && forecast.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground animate-fade-up [animation-delay:80ms]">
          <BarChart3 className="h-12 w-12 opacity-30" />
          <p className="font-medium">Hinnaandmed pole saadaval</p>
          <p className="text-sm">Prognoos laaditakse automaatselt, kui andmed on saadaval</p>
        </div>
      )}

      {forecast && forecast.length > 0 && (
        <>
          <Card className="animate-fade-up [animation-delay:80ms]">
            <CardHeader>
              <CardTitle className="text-base">Tunnihinnad (EUR/MWh)</CardTitle>
            </CardHeader>
            <CardContent>
              <ForecastChart data={forecast} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up [animation-delay:160ms]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Odavaimad tunnid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {cheapest?.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString("et-EE", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <PriceIndicator priceEurMwh={Number(entry.priceEurMwh)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kõik tunnid</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aeg</TableHead>
                        <TableHead>Hind</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forecast.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString("et-EE", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <PriceIndicator priceEurMwh={Number(entry.priceEurMwh)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </main>
  )
}
