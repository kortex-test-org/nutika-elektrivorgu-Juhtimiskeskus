import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test"

const mockInsertCommandLog = mock(() => Promise.resolve())
const mockUpdateDevice = mock(() => Promise.resolve())
const mockBroadcast = mock(() => {})

mock.module("../src/db/repository/device-log", () => ({
  insertCommandLog: mockInsertCommandLog,
}))

mock.module("../src/db/repository/device", () => ({
  updateDevice: mockUpdateDevice,
  getAllActiveDevices: mock(() => Promise.resolve([])),
}))

mock.module("../src/ws/manager", () => ({
  wsManager: { broadcast: mockBroadcast },
}))

mock.module("@smartgrid/shared", () => ({
  logger: { info: mock(() => {}), warning: mock(() => {}), error: mock(() => {}) },
}))

const { sendDeviceCommand } = await import("../src/services/device-control")

let originalSetTimeout: typeof globalThis.setTimeout

beforeEach(() => {
  mockInsertCommandLog.mockClear()
  mockUpdateDevice.mockClear()
  mockBroadcast.mockClear()
  originalSetTimeout = globalThis.setTimeout
  // Instant retries — no waiting in tests
  globalThis.setTimeout = ((fn: () => void) => {
    fn()
    return 0
  }) as unknown as typeof globalThis.setTimeout
})

afterEach(() => {
  globalThis.setTimeout = originalSetTimeout
})

describe("sendDeviceCommand — HTTP", () => {
  it("returns true and updates device state on success", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    ) as typeof fetch

    const result = await sendDeviceCommand({
      deviceId: "dev-1",
      host: "192.168.1.1",
      port: 80,
      topic: null,
      connectionType: "http",
      command: "on",
      triggeredBy: "manual",
      priceAtTime: 50,
    })

    expect(result).toBe(true)
    expect(mockUpdateDevice).toHaveBeenCalledWith("dev-1", { currentState: true })
    expect(mockInsertCommandLog).toHaveBeenCalled()
  })

  it("broadcasts device_state_changed on success", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("{}", { status: 200 })),
    ) as typeof fetch

    await sendDeviceCommand({
      deviceId: "dev-2",
      host: "192.168.1.2",
      port: null,
      topic: null,
      connectionType: "http",
      command: "off",
      triggeredBy: "auto",
    })

    const broadcastCalls = mockBroadcast.mock.calls
    const stateChangedCall = broadcastCalls.find(
      (call) => (call[0] as { type: string }).type === "device_state_changed",
    )
    expect(stateChangedCall).toBeDefined()
  })

  it("returns false and broadcasts device_disconnected after all retries fail", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("Network error"))) as typeof fetch

    const result = await sendDeviceCommand({
      deviceId: "dev-3",
      host: "192.168.1.3",
      port: 80,
      topic: null,
      connectionType: "http",
      command: "on",
      triggeredBy: "auto",
    })

    expect(result).toBe(false)
    expect(mockUpdateDevice).not.toHaveBeenCalled()

    const broadcastCalls = mockBroadcast.mock.calls
    const disconnectedCall = broadcastCalls.find(
      (call) => (call[0] as { type: string }).type === "device_disconnected",
    )
    expect(disconnectedCall).toBeDefined()
    expect((disconnectedCall?.[0] as { data: { deviceId: string } }).data.deviceId).toBe("dev-3")
  })

  it("always logs command regardless of success or failure", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("Unreachable"))) as typeof fetch

    await sendDeviceCommand({
      deviceId: "dev-4",
      host: "192.168.1.4",
      port: 80,
      topic: null,
      connectionType: "http",
      command: "off",
      triggeredBy: "manual",
    })

    expect(mockInsertCommandLog).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId: "dev-4",
        command: "off",
        triggeredBy: "manual",
      }),
    )
  })

  it("returns false for mqtt commands (not yet implemented)", async () => {
    const result = await sendDeviceCommand({
      deviceId: "dev-5",
      host: "mqtt.broker.local",
      port: 1883,
      topic: "home/device5",
      connectionType: "mqtt",
      command: "on",
      triggeredBy: "auto",
    })

    expect(result).toBe(false)
  })
})
