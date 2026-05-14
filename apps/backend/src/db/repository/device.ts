import { devices } from "@smartgrid/shared"
import { db } from "@smartgrid/shared/db"
import { and, asc, eq } from "drizzle-orm"

export const getDevicesByUserId = async (userId: string) => {
  return db.select().from(devices).where(eq(devices.userId, userId)).orderBy(asc(devices.createdAt))
}

export const getDeviceById = async (id: string) => {
  return db.query.devices.findFirst({ where: eq(devices.id, id) })
}

export const getDeviceByIdAndUserId = async (id: string, userId: string) => {
  return db.query.devices.findFirst({
    where: and(eq(devices.id, id), eq(devices.userId, userId)),
  })
}

export const getAllActiveDevices = async () => {
  return db.select().from(devices)
}

export const insertDevice = async (data: {
  userId: string
  name: string
  description?: string | null
  connectionType: string
  host?: string | null
  port?: number | null
  topic?: string | null
  threshold?: string | null
  powerConsumption?: string | null
  isCritical?: boolean
}) => {
  const result = await db.insert(devices).values(data).returning()
  return result[0]
}

export const updateDevice = async (
  id: string,
  data: Partial<{
    name: string
    description: string | null
    connectionType: string
    host: string | null
    port: number | null
    topic: string | null
    threshold: string | null
    powerConsumption: string | null
    isCritical: boolean
    overrideActive: boolean
    overrideState: boolean | null
    currentState: boolean
  }>,
) => {
  const result = await db.update(devices).set(data).where(eq(devices.id, id)).returning()
  return result[0]
}

export const deleteDevice = async (id: string) => {
  await db.delete(devices).where(eq(devices.id, id))
}
