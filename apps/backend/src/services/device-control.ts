import { logger } from "@smartgrid/shared/logger"
import { updateDevice } from "../db/repository/device"
import { insertCommandLog } from "../db/repository/device-log"
import { wsManager } from "../ws/manager"

const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1000

const sendHttpCommand = async (
  host: string,
  port: number | null,
  state: boolean,
  retries = 0,
): Promise<boolean> => {
  const baseUrl = port ? `http://${host}:${port}` : `http://${host}`
  const endpoint = `${baseUrl}/api/state`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => null)

  if (response?.ok) return true

  if (retries < MAX_RETRIES) {
    const delay = RETRY_BASE_DELAY_MS * 2 ** retries
    await new Promise((resolve) => setTimeout(resolve, delay))
    return sendHttpCommand(host, port, state, retries + 1)
  }

  return false
}

const sendMqttCommand = async (
  host: string,
  port: number | null,
  topic: string | null,
  state: boolean,
): Promise<boolean> => {
  logger.warning("MQTT not yet implemented", { host, port, topic, state })
  return false
}

export const sendDeviceCommand = async (params: {
  deviceId: string
  host: string | null | undefined
  port: number | null | undefined
  topic: string | null | undefined
  connectionType: string
  command: "on" | "off"
  triggeredBy: "auto" | "manual" | "override"
  priceAtTime?: number | null
}): Promise<boolean> => {
  const state = params.command === "on"
  const portValue = params.port ?? null
  const topicValue = params.topic ?? null

  let success = false

  if (params.connectionType === "mock") {
    success = true
  } else if (params.connectionType === "http" && params.host) {
    success = await sendHttpCommand(params.host, portValue, state)
  } else if (params.connectionType === "mqtt" && params.host) {
    success = await sendMqttCommand(params.host, portValue, topicValue, state)
  }

  await insertCommandLog({
    deviceId: params.deviceId,
    command: params.command,
    triggeredBy: params.triggeredBy,
    priceAtTime: params.priceAtTime?.toFixed(2) ?? null,
  })

  if (success) {
    await updateDevice(params.deviceId, { currentState: state })
    wsManager.broadcast({
      type: "device_state_changed",
      data: {
        deviceId: params.deviceId,
        state,
        triggeredBy: params.triggeredBy,
      },
    })
  } else {
    logger.error("Device command failed after retries", {
      deviceId: params.deviceId,
    })
    wsManager.broadcast({
      type: "device_disconnected",
      data: { deviceId: params.deviceId },
    })
  }

  return success
}
