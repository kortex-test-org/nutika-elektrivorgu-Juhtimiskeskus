import {
  CreateDeviceSchema,
  OverrideSchema,
  ToggleSchema,
  UpdateDeviceSchema,
} from "@smartgrid/shared"
import { Elysia, t } from "elysia"
import { authMiddleware } from "../../middleware/auth"
import {
  addDevice,
  getDeviceLogs,
  getDeviceStatus,
  listDevices,
  modifyDevice,
  removeDevice,
  setDeviceOverride,
  toggleDevice,
} from "./devices.service"

export const devicesController = new Elysia({ prefix: "/api/devices" })
  .use(authMiddleware)
  .get("/", async ({ user }) => {
    return { devices: await listDevices(user.id) }
  })
  .post(
    "/",
    async ({ user, body, set }) => {
      const device = await addDevice(user.id, body).catch((error: Error) => {
        set.status = 400
        throw new Error(error.message)
      })
      return { device }
    },
    { body: CreateDeviceSchema },
  )
  .patch(
    "/:id",
    async ({ user, params, body, set }) => {
      const device = await modifyDevice(params.id, user.id, body).catch((error: Error) => {
        set.status = 404
        throw new Error(error.message)
      })
      return { device }
    },
    { body: UpdateDeviceSchema },
  )
  .delete("/:id", async ({ user, params, set }) => {
    await removeDevice(params.id, user.id).catch((error: Error) => {
      set.status = 404
      throw new Error(error.message)
    })
    return { message: "Device deleted" }
  })
  .get("/:id/status", async ({ user, params, set }) => {
    const status = await getDeviceStatus(params.id, user.id).catch((error: Error) => {
      set.status = 404
      throw new Error(error.message)
    })
    return { status }
  })
  .post(
    "/:id/toggle",
    async ({ user, params, body, set }) => {
      const result = await toggleDevice(params.id, user.id, body.state).catch((error: Error) => {
        set.status = 404
        throw new Error(error.message)
      })
      return result
    },
    { body: ToggleSchema },
  )
  .post(
    "/:id/override",
    async ({ user, params, body, set }) => {
      const result = await setDeviceOverride(params.id, user.id, body.active, body.state).catch(
        (error: Error) => {
          set.status = 404
          throw new Error(error.message)
        },
      )
      return { device: result }
    },
    { body: OverrideSchema },
  )
  .get(
    "/:id/logs",
    async ({ user, params, query, set }) => {
      const limit = Math.min(Number(query.limit ?? 50), 100)
      const offset = Number(query.offset ?? 0)
      const logs = await getDeviceLogs(params.id, user.id, limit, offset).catch((error: Error) => {
        set.status = 404
        throw new Error(error.message)
      })
      return { logs }
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
    },
  )
