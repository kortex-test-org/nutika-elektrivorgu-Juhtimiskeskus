import { CreateUserSchema, UpdateUserSchema } from "@smartgrid/shared"
import { Elysia } from "elysia"
import { roleMiddleware } from "../../middleware/role"
import { createUser, deactivateUser, listUsers, patchUser, removeUser } from "./users.service"

export const usersController = new Elysia({ prefix: "/api/users" })
  .use(roleMiddleware)
  .get("/", async () => {
    return { users: await listUsers() }
  })
  .post(
    "/",
    async ({ body, set }) => {
      const user = await createUser(body.email, body.password, body.role ?? "user").catch(
        (error: Error) => {
          set.status = 400
          throw new Error(error.message)
        },
      )
      return { user }
    },
    { body: CreateUserSchema },
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const user = await patchUser(params.id, body).catch((error: Error) => {
        set.status = 404
        throw new Error(error.message)
      })
      return { user }
    },
    { body: UpdateUserSchema },
  )
  .delete("/:id", async ({ params, set }) => {
    await removeUser(params.id).catch((error: Error) => {
      set.status = 404
      throw new Error(error.message)
    })
    return { message: "User deleted" }
  })
  .patch("/:id/deactivate", async ({ params, set }) => {
    const user = await deactivateUser(params.id).catch((error: Error) => {
      set.status = 404
      throw new Error(error.message)
    })
    return { user }
  })
