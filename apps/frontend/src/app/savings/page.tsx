"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { SavingsConfigDto, SavingsPeriod } from "@smartgrid/shared"
import { SavingsConfigSchema } from "@smartgrid/shared"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("savings")
  const { data, isLoading } = useSavings(period)

  if (isLoading) return <div className="h-48 animate-pulse bg-muted rounded-lg" />

  if (!data) return <div className="text-muted-foreground text-sm">{t("noData")}</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              {t("totalSavings")}
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
            <CardTitle className="text-xs text-muted-foreground font-normal">
              {t("dataPoints")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.details.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              {t("period")}
            </CardTitle>
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
  const t = useTranslations("savings")
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
      onSuccess: () => toast({ title: t("saved") }),
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  if (isLoading) return <div className="h-20 animate-pulse bg-muted rounded-lg" />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fixedRate">{t("fixedRate")}</Label>
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
      <Button
        type="submit"
        disabled={isSubmitting || updateMutation.isPending}
        className="shadow-lg shadow-violet-900/40"
      >
        {t("save")}
      </Button>
    </form>
  )
}

export default function SavingsPage() {
  const t = useTranslations("savings")
  const [tab, setTab] = useState<SavingsPeriod>("day")

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold animate-fade-up w-fit bg-linear-to-r from-foreground to-violet-500 bg-clip-text text-transparent">
        {t("title")}
      </h1>

      <div className="animate-fade-up [animation-delay:80ms]">
        <Tabs value={tab} onValueChange={(v) => setTab(v as SavingsPeriod)}>
          <TabsList>
            <TabsTrigger value="day">{t("day")}</TabsTrigger>
            <TabsTrigger value="week">{t("week")}</TabsTrigger>
            <TabsTrigger value="month">{t("month")}</TabsTrigger>
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
      </div>

      <div className="animate-fade-up [animation-delay:160ms]">
        <h2 className="text-lg font-semibold mb-4">{t("tariffSettings")}</h2>
        <SavingsConfigForm />
      </div>
    </main>
  )
}
