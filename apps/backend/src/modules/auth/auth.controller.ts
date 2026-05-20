import { jwt } from "@elysiajs/jwt"
import { LoginSchema, RegisterSchema } from "@smartgrid/shared"
import { Elysia, t } from "elysia"
import { config } from "../../config"
import { authMiddleware } from "../../middleware/auth"
import { getCurrentUser, loginUser, registerUser, updateCurrentUser } from "./auth.service"

export const authController = new Elysia({ prefix: "/api/auth" })
  .use(jwt({ name: "jwt", secret: config.jwtSecret }))
  .post(
    "/register",
    async ({ body, set }) => {
      const user = await registerUser(body.username, body.password).catch((error: Error) => {
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
      const user = await loginUser(body.username, body.password).catch((error: Error) => {
        set.status = 401
        throw new Error(error.message)
      })
      const token = await jwtInstance.sign({
        id: user.id,
        username: user.username,
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
  .patch(
    "/me",
    async ({ user, body, set }) => {
      const updated = await updateCurrentUser(user.id, body).catch((error: Error) => {
        set.status = 400
        throw new Error(error.message)
      })
      return { user: updated }
    },
    {
      body: t.Object({
        username: t.Optional(t.String({ minLength: 1 })),
        password: t.Optional(t.String({ minLength: 8 })),
      }),
    },
  )
