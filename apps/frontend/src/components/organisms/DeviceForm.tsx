"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { CreateDeviceDto, UpdateDeviceDto } from "@smartgrid/shared"
import { CreateDeviceSchema, UpdateDeviceSchema } from "@smartgrid/shared"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DeviceFormCreateProps {
  mode: "create"
  onSubmit: (data: CreateDeviceDto) => Promise<void>
  isLoading?: boolean
}

interface DeviceFormEditProps {
  mode: "edit"
  defaultValues: Partial<CreateDeviceDto>
  onSubmit: (data: UpdateDeviceDto) => Promise<void>
  isLoading?: boolean
}

type DeviceFormProps = DeviceFormCreateProps | DeviceFormEditProps

export function DeviceForm(props: DeviceFormProps) {
  const t = useTranslations("deviceForm")
  const isEdit = props.mode === "edit"

  const schema = isEdit ? UpdateDeviceSchema : CreateDeviceSchema

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateDeviceDto>({
    // biome-ignore lint/suspicious/noExplicitAny: union of Create/Update schemas
    resolver: typeboxResolver(schema) as any,
    defaultValues: isEdit ? (props as DeviceFormEditProps).defaultValues : undefined,
  })

  const connectionType = watch("connectionType")

  const onSubmit = async (data: CreateDeviceDto) => {
    // biome-ignore lint/suspicious/noExplicitAny: union of two schemas
    await (props.onSubmit as (d: any) => Promise<void>)(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" placeholder={t("namePlaceholder")} {...register("name")} />
        {errors.name && (
          <span className="text-destructive text-xs">{errors.name.message as string}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t("description")}</Label>
        <Input
          id="description"
          placeholder={t("descriptionPlaceholder")}
          {...register("description")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("connectionType")}</Label>
        <Select
          defaultValue={
            isEdit ? (props as DeviceFormEditProps).defaultValues?.connectionType : undefined
          }
          onValueChange={(v) => setValue("connectionType", v as "http" | "mqtt")}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="http">HTTP</SelectItem>
            <SelectItem value="mqtt">MQTT</SelectItem>
          </SelectContent>
        </Select>
        {errors.connectionType && (
          <span className="text-destructive text-xs">
            {errors.connectionType.message as string}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(9rem,100%),1fr))] gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="host">{t("host")}</Label>
          <Input id="host" placeholder="192.168.1.100" {...register("host")} />
          {errors.host && (
            <span className="text-destructive text-xs">{errors.host.message as string}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="port">{t("portOptional")}</Label>
          <Input
            id="port"
            type="number"
            placeholder="80"
            {...register("port", { valueAsNumber: true })}
          />
        </div>
      </div>

      {connectionType === "mqtt" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="topic">{t("mqttTopic")}</Label>
          <Input id="topic" placeholder="home/boiler" {...register("topic")} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="threshold">{t("threshold")}</Label>
        <Input
          id="threshold"
          type="number"
          step="0.01"
          placeholder="100"
          {...register("threshold", { valueAsNumber: true })}
        />
        <span className="text-xs text-muted-foreground">{t("thresholdHint")}</span>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isCritical"
          checked={watch("isCritical") ?? false}
          onCheckedChange={(checked) => setValue("isCritical", checked === true)}
        />
        <Label htmlFor="isCritical" className="font-normal cursor-pointer">
          {t("isCritical")}
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting || props.isLoading} className="mt-2">
        {isSubmitting ? t("saving") : isEdit ? t("saveChanges") : t("addDevice")}
      </Button>
    </form>
  )
}
