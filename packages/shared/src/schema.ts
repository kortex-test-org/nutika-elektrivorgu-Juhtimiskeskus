import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  connectionType: varchar("connection_type", { length: 20 }).notNull(),
  host: varchar("host", { length: 255 }),
  port: integer("port"),
  topic: varchar("topic", { length: 255 }),
  threshold: numeric("threshold", { precision: 10, scale: 2 }),
  powerConsumption: numeric("power_consumption", { precision: 10, scale: 2 }),
  isCritical: boolean("is_critical").notNull().default(false),
  overrideActive: boolean("override_active").notNull().default(false),
  overrideState: boolean("override_state"),
  currentState: boolean("current_state").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const deviceCommandsLog = pgTable("device_commands_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: uuid("device_id")
    .notNull()
    .references(() => devices.id, { onDelete: "cascade" }),
  command: varchar("command", { length: 10 }).notNull(),
  triggeredBy: varchar("triggered_by", { length: 20 }).notNull(),
  priceAtTime: numeric("price_at_time", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const prices = pgTable("prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  timestamp: timestamp("timestamp").notNull().unique(),
  priceEurMwh: numeric("price_eur_mwh", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 50 }).notNull().default("elering"),
})

export const savingsConfig = pgTable("savings_config", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fixedRateEurKwh: numeric("fixed_rate_eur_kwh", {
    precision: 10,
    scale: 4,
  }).notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const notificationSettings = pgTable("notification_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  channel: varchar("channel", { length: 20 }),
  telegramChatId: varchar("telegram_chat_id", { length: 100 }),
  discordWebhookUrl: varchar("discord_webhook_url", { length: 500 }),
  criticalPriceThreshold: numeric("critical_price_threshold", {
    precision: 10,
    scale: 2,
  }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
