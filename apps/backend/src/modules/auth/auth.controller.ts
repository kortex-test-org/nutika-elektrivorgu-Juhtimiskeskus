import { jwt } from "@elysiajs/jwt"
import { LoginSchema, RegisterSchema } from "@smartgrid/shared"
import { Elysia } from "elysia"
import { config } from "../../config"
import { authMiddleware } from "../../middleware/auth"
import { getCurrentUser, loginUser, registerUser } from "./auth.service"

export const authController = new Elysia({ prefix: "/api/auth" })
  .use(jwt({ name: "jwt", secret: config.jwtSecret }))
  .post(
    "/register",
    async ({ body, set }) => {
      const user = await registerUser(body.email, body.password).catch((error: Error) => {
        set.status = 400
        throw new Error(error.message)
      })
      return { user }
    },
    { body: RegisterSchema },
  )
  .post(
    "/login",
    async ({ body, jwt: jwtInstance, set }) => {
      const user = await loginUser(body.email, body.password).catch((error: Error) => {
        set.status = 401
        throw new Error(error.message)
      })
      const token = await jwtInstance.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      })
      return { token, user }
    },
    { body: LoginSchema },
  )
  .post("/logout", () => {
    return { message: "Logged out" }
  })
  .use(authMiddleware)
  .get("/me", async ({ user, set }) => {
    const currentUser = await getCurrentUser(user.id).catch((error: Error) => {
      set.status = 404
      throw new Error(error.message)
    })
    return { user: currentUser }
  })
