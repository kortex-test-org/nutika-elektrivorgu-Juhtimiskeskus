import { FormatRegistry, Type } from "@sinclair/typebox"

FormatRegistry.Set("email", (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))

export const LoginSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 1 }),
})

export const RegisterSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
})

export const CreateUserSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
  role: Type.Optional(Type.Union([Type.Literal("master"), Type.Literal("user")])),
})

export const UpdateUserSchema = Type.Object({
  email: Type.Optional(Type.String({ format: "email" })),
  password: Type.Optional(Type.String({ minLength: 8 })),
  isActive: Type.Optional(Type.Boolean()),
  role: Type.Optional(Type.Union([Type.Literal("master"), Type.Literal("user")])),
})

export const CreateDeviceSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.Optional(Type.String()),
  connectionType: Type.Union([Type.Literal("http"), Type.Literal("mqtt"), Type.Literal("mock")]),
  host: Type.Optional(Type.String()),
  port: Type.Optional(Type.Number({ minimum: 1, maximum: 65535 })),
  topic: Type.Optional(Type.String()),
  threshold: Type.Optional(Type.Number({ minimum: -500 })),
  powerConsumption: Type.Optional(Type.Number({ minimum: 0 })),
  isCritical: Type.Optional(Type.Boolean()),
})

export const UpdateDeviceSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  description: Type.Optional(Type.String()),
  connectionType: Type.Optional(
    Type.Union([Type.Literal("http"), Type.Literal("mqtt"), Type.Literal("mock")]),
  ),
  host: Type.Optional(Type.String()),
  port: Type.Optional(Type.Number({ minimum: 1, maximum: 65535 })),
  topic: Type.Optional(Type.String()),
  threshold: Type.Optional(Type.Number({ minimum: -500 })),
  powerConsumption: Type.Optional(Type.Number({ minimum: 0 })),
  isCritical: Type.Optional(Type.Boolean()),
})

export const ToggleSchema = Type.Object({
  state: Type.Boolean(),
})

export const OverrideSchema = Type.Object({
  active: Type.Boolean(),
  state: Type.Optional(Type.Boolean()),
})

export const SavingsConfigSchema = Type.Object({
  fixedRateEurKwh: Type.Number({ minimum: 0 }),
})

export const NotificationSettingsSchema = Type.Object({
  channel: Type.Optional(
    Type.Union([Type.Literal("telegram"), Type.Literal("discord"), Type.Null()]),
  ),
  telegramChatId: Type.Optional(Type.String()),
  discordWebhookUrl: Type.Optional(Type.String()),
  criticalPriceThreshold: Type.Optional(Type.Number()),
})
