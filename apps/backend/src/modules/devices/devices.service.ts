import type { CreateDeviceDto, UpdateDeviceDto } from "@smartgrid/shared"
import {
  deleteDevice,
  getDeviceByIdAndUserId,
  getDevicesByUserId,
  insertDevice,
  updateDevice,
} from "../../db/repository/device"
import { getCommandLogsByDeviceId } from "../../db/repository/device-log"
import { sendDeviceCommand } from "../../services/device-control"

export const listDevices = async (userId: string) => {
  return getDevicesByUserId(userId)
}

const testDeviceConnection = async (
  host: string,
  port: number | undefined | null,
  connectionType: string,
): Promise<boolean> => {
  if (connectionType === "http") {
    const baseUrl = port ? `http://${host}:${port}` : `http://${host}`
    const response = await fetch(`${baseUrl}/api/state`, {
      signal: AbortSignal.timeout(5000),
    }).catch(() => null)
    return response !== null
  }
  return true
}

export const addDevice = async (userId: string, data: CreateDeviceDto) => {
  const connected = await testDeviceConnection(data.host, data.port, data.connectionType)

  const device = await insertDevice({
    userId,
    name: data.name,
    description: data.description ?? null,
    connectionType: data.connectionType,
    host: data.host,
    port: data.port ?? null,
    topic: data.topic ?? null,
    threshold: data.threshold?.toFixed(2) ?? null,
    isCritical: data.isCritical ?? false,
  })

  if (!device) throw new Error("Failed to create device")

  return { ...device, connectionTest: connected }
}

export const modifyDevice = async (id: string, userId: string, data: UpdateDeviceDto) => {
  const device = await getDeviceByIdAndUserId(id, userId)
  if (!device) throw new Error("Device not found")

  const updated = await updateDevice(id, {
    name: data.name,
    description: data.description ?? undefined,
    connectionType: data.connectionType,
    host: data.host,
    port: data.port ?? undefined,
    topic: data.topic ?? undefined,
    threshold: data.threshold?.toFixed(2) ?? undefined,
    isCritical: data.isCritical,
  })

  return updated
}

export const removeDevice = async (id: string, userId: string) => {
  const device = await getDeviceByIdAndUserId(id, userId)
  if (!device) throw new Error("Device not found")
  await deleteDevice(id)
}

export const getDeviceStatus = async (id: string, userId: string) => {
  const device = await getDeviceByIdAndUserId(id, userId)
  if (!device) throw new Error("Device not found")
  return {
    id: device.id,
    currentState: device.currentState,
    overrideActive: device.overrideActive,
    overrideState: device.overrideState,
  }
}

export const toggleDevice = async (
  id: string,
  userId: string,
  state: boolean,
  priceAtTime?: number | null,
) => {
  const device = await getDeviceByIdAndUserId(id, userId)
  if (!device) throw new Error("Device not found")

  const success = await sendDeviceCommand({
    deviceId: device.id,
    host: device.host,
    port: device.port,
    topic: device.topic,
    connectionType: device.connectionType,
    command: state ? "on" : "off",
    triggeredBy: "manual",
    priceAtTime,
  })

  return { success, state }
}

export const setDeviceOverride = async (
  id: string,
  userId: string,
  active: boolean,
  state?: boolean | null,
) => {
  const device = await getDeviceByIdAndUserId(id, userId)
  if (!device) throw new Error("Device not found")

  const updated = await updateDevice(id, {
    overrideActive: active,
    overrideState: state ?? null,
  })

  if (active && state !== undefined && state !== null) {
    await sendDeviceCommand({
      deviceId: device.id,
      host: device.host,
      port: device.port,
      topic: device.topic,
      connectionType: device.connectionType,
      command: state ? "on" : "off",
      triggeredBy: "override",
    })
  }

  return updated
}

export const getDeviceLogs = async (id: string, userId: string, limit = 50, offset = 0) => {
  const device = await getDeviceByIdAndUserId(id, userId)
  if (!device) throw new Error("Device not found")
  return getCommandLogsByDeviceId(id, limit, offset)
}
