import fs from "node:fs"
import path from "node:path"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { runMigrations } from "@smartgrid/shared/db"
import { logger } from "@smartgrid/shared/logger"
import { Elysia } from "elysia"
import cron from "node-cron"
import { config } from "./config"
import { authController } from "./modules/auth"
import { devicesController } from "./modules/devices"
import { notificationsController } from "./modules/notifications"
import { pricesController } from "./modules/prices"
import { savingsController } from "./modules/savings"
import { usersController } from "./modules/users"
import { runAutomationCycle } from "./services/automation"
import { pollAllTelegramBots } from "./services/telegramBot"
import { wsHandler } from "./ws/handler"

const getMigrationsFolder = (): string => {
  const isProd = Boolean(config.databaseUrl)
  const dirName = isProd ? "drizzle" : "drizzle-local"

  const pathsToTry = [
    path.resolve(import.meta.dir, "../../../", dirName), // Dev path
    path.resolve(process.cwd(), dirName), // Prod/Docker working directory path
    path.resolve(import.meta.dir, "../", dirName), // Relative to dist
    path.join("/", dirName), // Fallback to /drizzle
  ]

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      return p
    }
  }
  return pathsToTry[0] ?? ""
}

const migrationsFolder = getMigrationsFolder()

import crypto from "node:crypto"
import { getUserCount } from "./db/repository/user"
import { registerUser } from "./modules/auth/auth.service"

await runMigrations(migrationsFolder)
logger.info("Database migrations applied")

// Seed default admin user on first launch
const userCount = await getUserCount()
if (userCount === 0) {
  const defaultPassword = crypto.randomBytes(6).toString("hex") // 12 character secure password
  await registerUser("admin", defaultPassword)
  logger.info("┌────────────────────────────────────────────────────────┐")
  logger.info("│              INITIAL ADMIN CREDENTIALS                 │")
  logger.info("├────────────────────────────────────────────────────────┤")
  logger.info("│  Login:    admin                                       │")
  logger.info(`│  Password: ${defaultPassword}                                │`)
  logger.info("└────────────────────────────────────────────────────────┘")
}

const app = new Elysia()
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get("origin")
        return origin ? true : false
      },
      credentials: true,
      allowedHeaders: ["content-type", "authorization"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  .use(swagger({ path: "/docs" }))
  .onError(({ error, set }) => {
    const message = error instanceof Error ? error.message : "Internal server error"
    if (!(error instanceof Error) || !set.status || Number(set.status) < 400) {
      set.status = 500
    }
    return { error: message }
  })
  .use(authController)
  .use(usersController)
  .use(devicesController)
  .use(pricesController)
  .use(savingsController)
  .use(notificationsController)
  .use(wsHandler)
  .listen(config.port)

runAutomationCycle().catch((error: unknown) => {
  logger.error("Initial automation cycle failed", { error: String(error) })
})

cron.schedule("*/15 * * * *", () => {
  runAutomationCycle().catch((error: unknown) => {
    logger.error("15-minute automation cycle failed", { error: String(error) })
  })
})

// Start Telegram Bot Polling service (every 10 seconds)
pollAllTelegramBots().catch((error: unknown) => {
  logger.error("Initial Telegram bot polling failed", { error: String(error) })
})

setInterval(() => {
  pollAllTelegramBots().catch((error: unknown) => {
    logger.error("Telegram bot polling cycle failed", { error: String(error) })
  })
}, 10000)

logger.info(`Backend running at http://localhost:${config.port}`)

export type App = typeof app
