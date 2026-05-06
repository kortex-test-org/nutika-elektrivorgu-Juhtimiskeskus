import { db, deviceCommandsLog } from "@smartgrid/shared"
import { desc, eq } from "drizzle-orm"

export const insertCommandLog = async (data: {
  deviceId: string
  command: string
  triggeredBy: string
  priceAtTime?: string | null
}) => {
  const result = await db.insert(deviceCommandsLog).values(data).returning()
  return result[0]
}

export const getCommandLogsByDeviceId = async (deviceId: string, limit = 50, offset = 0) => {
  return db
    .select()
    .from(deviceCommandsLog)
    .where(eq(deviceCommandsLog.deviceId, deviceId))
    .orderBy(desc(deviceCommandsLog.createdAt))
    .limit(limit)
    .offset(offset)
}
