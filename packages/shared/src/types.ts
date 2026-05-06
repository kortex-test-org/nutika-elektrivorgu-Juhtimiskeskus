import type { Static } from "@sinclair/typebox"
import type {
  CreateDeviceSchema,
  CreateUserSchema,
  LoginSchema,
  NotificationSettingsSchema,
  OverrideSchema,
  RegisterSchema,
  SavingsConfigSchema,
  ToggleSchema,
  UpdateDeviceSchema,
  UpdateUserSchema,
} from "./validators"

export type LoginDto = Static<typeof LoginSchema>
export type RegisterDto = Static<typeof RegisterSchema>
export type CreateUserDto = Static<typeof CreateUserSchema>
export type UpdateUserDto = Static<typeof UpdateUserSchema>
export type CreateDeviceDto = Static<typeof CreateDeviceSchema>
export type UpdateDeviceDto = Static<typeof UpdateDeviceSchema>
export type ToggleDto = Static<typeof ToggleSchema>
export type OverrideDto = Static<typeof OverrideSchema>
export type SavingsConfigDto = Static<typeof SavingsConfigSchema>
export type NotificationSettingsDto = Static<typeof NotificationSettingsSchema>

export type UserRole = "master" | "user"
export type DeviceConnectionType = "http" | "mqtt"
export type DeviceCommand = "on" | "off"
export type CommandTrigger = "auto" | "manual" | "override"
export type NotificationChannel = "telegram" | "discord"
export type SavingsPeriod = "day" | "week" | "month"

export type WSEvent =
  | { type: "price_update"; data: { priceEurMwh: number; timestamp: string } }
  | {
      type: "device_state_changed"
      data: { deviceId: string; state: boolean; triggeredBy: string }
    }
  | { type: "device_disconnected"; data: { deviceId: string } }
  | {
      type: "price_threshold_alert"
      data: { priceEurMwh: number; threshold: number }
    }
