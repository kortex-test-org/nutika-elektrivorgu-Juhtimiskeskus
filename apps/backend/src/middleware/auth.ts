import { jwt } from "@elysiajs/jwt"
import { Elysia } from "elysia"
import { config } from "../config"
import { getUserById } from "../db/repository/user"

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

    if (!payload || !payload.id) {
      set.status = 401
      throw new Error("Invalid or expired token")
    }

    const user = await getUserById(payload.id as string)
    if (!user) {
      set.status = 401
      throw new Error("User no longer exists")
    }

    if (!user.isActive) {
      set.status = 401
      throw new Error("User is deactivated")
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role as "master" | "user",
      },
    }
  })
