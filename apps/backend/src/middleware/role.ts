import { Elysia } from "elysia"
import { authMiddleware } from "./auth"

export const roleMiddleware = new Elysia({ name: "role-middleware" })
  .use(authMiddleware)
  .derive({ as: "scoped" }, ({ user, set }) => {
    if (!user || user.role !== "master") {
      set.status = 403
      throw new Error("Forbidden: master role required")
    }
    return {}
  })
