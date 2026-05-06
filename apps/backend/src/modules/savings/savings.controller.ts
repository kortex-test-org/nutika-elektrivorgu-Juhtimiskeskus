import type { SavingsPeriod } from "@smartgrid/shared"
import { SavingsConfigSchema } from "@smartgrid/shared"
import { Elysia, t } from "elysia"
import { getSavingsConfig, upsertSavingsConfig } from "../../db/repository/savings"
import { authMiddleware } from "../../middleware/auth"
import { calculateSavings } from "../../services/savings"

const VALID_PERIODS: SavingsPeriod[] = ["day", "week", "month"]

export const savingsController = new Elysia({ prefix: "/api/savings" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ user, query, set }) => {
      const period = (query.period ?? "day") as SavingsPeriod
      if (!VALID_PERIODS.includes(period)) {
        set.status = 400
        throw new Error("Invalid period. Use: day, week, month")
      }
      const result = await calculateSavings(user.id, period)
      return result
    },
    {
      query: t.Object({
        period: t.Optional(t.String()),
      }),
    },
  )
  .get("/config", async ({ user, set }) => {
    const config = await getSavingsConfig(user.id)
    if (!config) {
      set.status = 404
      throw new Error("Savings config not found")
    }
    return { config }
  })
  .put(
    "/config",
    async ({ user, body }) => {
      const config = await upsertSavingsConfig(user.id, body.fixedRateEurKwh.toFixed(4))
      return { config }
    },
    { body: SavingsConfigSchema },
  )
