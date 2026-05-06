import { Elysia, t } from "elysia"
import { getLatestPrice, getPricesByRange } from "../../db/repository/price"
import { authMiddleware } from "../../middleware/auth"
import { fetchAndStorePrices } from "../../services/elering"

export const pricesController = new Elysia({ prefix: "/api/prices" })
  .use(authMiddleware)
  .get("/current", async ({ set }) => {
    const price = await getLatestPrice()
    if (!price) {
      set.status = 404
      throw new Error("No price data available")
    }
    return { price }
  })
  .get("/forecast", async () => {
    await fetchAndStorePrices()
    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const forecast = await getPricesByRange(now, in24h)
    return { forecast }
  })
  .get(
    "/history",
    async ({ query, set }) => {
      if (!query.from || !query.to) {
        set.status = 400
        throw new Error("Query params 'from' and 'to' are required")
      }
      const from = new Date(query.from)
      const to = new Date(query.to)
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        set.status = 400
        throw new Error("Invalid date format")
      }
      const history = await getPricesByRange(from, to)
      return { history }
    },
    {
      query: t.Object({
        from: t.Optional(t.String()),
        to: t.Optional(t.String()),
      }),
    },
  )
