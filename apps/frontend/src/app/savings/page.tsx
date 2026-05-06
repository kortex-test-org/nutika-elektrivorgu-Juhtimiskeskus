"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { SavingsConfigDto, SavingsPeriod } from "@smartgrid/shared"
import { SavingsConfigSchema } from "@smartgrid/shared"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { SavingsChart } from "@/components/organisms/SavingsChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useSavings, useSavingsConfig, useUpdateSavingsConfig } from "@/hooks/useSavings"

function SavingsPeriodTab({ period }: { period: SavingsPeriod }) {
  const { data, isLoading } = useSavings(period)

  if (isLoading) return <div className="h-48 animate-pulse bg-muted rounded-lg" />

  if (!data) return <div className="text-muted-foreground text-sm">Andmed pole saadaval</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Kogukokkuhoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {data.totalSavingsEur >= 0 ? "+" : ""}
              {data.totalSavingsEur.toFixed(4)} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">Andmepunkte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.details.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">Periood</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium capitalize">{data.period}</p>
          </CardContent>
        </Card>
      </div>
      {data.details.length > 0 && <SavingsChart details={data.details} period={period} />}
    </div>
  )
}

function SavingsConfigForm() {
  const { data: config, isLoading } = useSavingsConfig()
  const updateMutation = useUpdateSavingsConfig()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SavingsConfigDto>({
    resolver: typeboxResolver(SavingsConfigSchema),
    values: config ? { fixedRateEurKwh: Number(config.fixedRateEurKwh) } : undefined,
  })

  const onSubmit = async (data: SavingsConfigDto) => {
    await updateMutation.mutateAsync(data, {
      onSuccess: () => toast({ title: "Konfiguratsioon salvestatud" }),
      onError: (err) => toast({ title: "Viga", description: err.message, variant: "destructive" }),
    })
  }

  if (isLoading) return <div className="h-20 animate-pulse bg-muted rounded-lg" />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fixedRate">Fikseeritud tariif (€/kWh)</Label>
        <Input
          id="fixedRate"
          type="number"
          step="0.0001"
          placeholder="0.1500"
          {...register("fixedRateEurKwh", { valueAsNumber: true })}
        />
        {errors.fixedRateEurKwh && (
          <span className="text-destructive text-xs">
            {errors.fixedRateEurKwh.message as string}
          </span>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
        Salvesta
      </Button>
    </form>
  )
}

export default function SavingsPage() {
  const [tab, setTab] = useState<SavingsPeriod>("day")

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Kokkuhoid</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SavingsPeriod)}>
        <TabsList>
          <TabsTrigger value="day">Päev</TabsTrigger>
          <TabsTrigger value="week">Nädal</TabsTrigger>
          <TabsTrigger value="month">Kuu</TabsTrigger>
        </TabsList>
        <TabsContent value="day" className="mt-4">
          <SavingsPeriodTab period="day" />
        </TabsContent>
        <TabsContent value="week" className="mt-4">
          <SavingsPeriodTab period="week" />
        </TabsContent>
        <TabsContent value="month" className="mt-4">
          <SavingsPeriodTab period="month" />
        </TabsContent>
      </Tabs>

      <div>
        <h2 className="text-lg font-semibold mb-4">Tariifi seaded</h2>
        <SavingsConfigForm />
      </div>
    </main>
  )
}
