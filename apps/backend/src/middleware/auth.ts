import { jwt } from "@elysiajs/jwt"
import { Elysia } from "elysia"
import { config } from "../config"

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .use(
    jwt({
      name: "jwt",
      secret: config.jwtSecret,
    }),
  )
  .derive({ as: "scoped" }, async ({ jwt: jwtInstance, headers, set }) => {
    const authorization = headers.authorization
    if (!authorization?.startsWith("Bearer ")) {
      set.status = 401
      throw new Error("Unauthorized")
    }

    const token = authorization.slice(7)
    const payload = await jwtInstance.verify(token)

    if (!payload) {
      set.status = 401
      throw new Error("Invalid or expired token")
    }

    return {
      user: payload as { id: string; email: string; role: string },
    }
  })
