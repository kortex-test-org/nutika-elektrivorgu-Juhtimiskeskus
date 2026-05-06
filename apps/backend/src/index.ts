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
import { wsHandler } from "./ws/handler"

const migrationsFolder = config.databaseUrl
  ? path.resolve(import.meta.dir, "../../../drizzle")
  : path.resolve(import.meta.dir, "../../../drizzle-local")

await runMigrations(migrationsFolder)
logger.info("Database migrations applied")

const app = new Elysia()
  .use(cors())
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

cron.schedule("0 * * * *", () => {
  runAutomationCycle().catch((error: unknown) => {
    logger.error("Hourly automation cycle failed", { error: String(error) })
  })
})

logger.info(`Backend running at http://localhost:${config.port}`)

export type App = typeof app
