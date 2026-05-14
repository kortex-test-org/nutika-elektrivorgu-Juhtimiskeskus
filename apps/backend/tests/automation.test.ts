import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

const mockFetchAndStorePrices = mock(() => Promise.resolve())
const mockGetCurrentPrice = mock(() => Promise.resolve(null))
const mockGetAllActiveDevices = mock(() => Promise.resolve([]))
const mockGetAllSettingsWithThreshold = mock(() => Promise.resolve([]))
const mockSendDeviceCommand = mock(() => Promise.resolve(true))
const mockBroadcast = mock(() => {})

mock.module("../src/services/elering", () => ({
  fetchAndStorePrices: mockFetchAndStorePrices,
}))

mock.module("../src/db/repository/price", () => ({
  getLatestPrice: mock(() => Promise.resolve(null)),
  getCurrentPrice: mockGetCurrentPrice,
  getPricesByRange: mock(() => Promise.resolve([])),
  upsertPrices: mock(() => Promise.resolve()),
}))

mock.module("../src/db/repository/device", () => ({
  getAllActiveDevices: mockGetAllActiveDevices,
  updateDevice: mock(() => Promise.resolve()),
}))

mock.module("../src/db/repository/notification", () => ({
  getAllSettingsWithThreshold: mockGetAllSettingsWithThreshold,
  getNotificationSettings: mock(() => Promise.resolve(null)),
  upsertNotificationSettings: mock(() => Promise.resolve(null)),
}))

mock.module("../src/services/device-control", () => ({
  sendDeviceCommand: mockSendDeviceCommand,
}))

mock.module("../src/ws/manager", () => ({
  wsManager: { broadcast: mockBroadcast },
}))

mock.module("@smartgrid/shared", () => ({
  logger: { info: mock(() => {}), warning: mock(() => {}), error: mock(() => {}) },
}))

let runAutomationCycle: () => Promise<void>

beforeAll(async () => {
  const mod = await import("../src/services/automation")
  runAutomationCycle = mod.runAutomationCycle
})

beforeEach(() => {
  mockFetchAndStorePrices.mockClear()
  mockGetCurrentPrice.mockClear()
  mockGetAllActiveDevices.mockClear()
  mockGetAllSettingsWithThreshold.mockClear()
  mockSendDeviceCommand.mockClear()
  mockBroadcast.mockClear()
})

describe("runAutomationCycle", () => {
  it("skips automation when no price data is available", async () => {
    mockGetCurrentPrice.mockResolvedValue(null)

    await runAutomationCycle()

    expect(mockGetAllActiveDevices).not.toHaveBeenCalled()
    expect(mockSendDeviceCommand).not.toHaveBeenCalled()
  })

  it("broadcasts price_update on every cycle", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "50.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([])

    await runAutomationCycle()

    const broadcastCalls = mockBroadcast.mock.calls
    const priceUpdateCall = broadcastCalls.find(
      (call) => (call[0] as { type: string }).type === "price_update",
    )
    expect(priceUpdateCall).toBeDefined()
    expect((priceUpdateCall?.[0] as { data: { priceEurMwh: number } }).data.priceEurMwh).toBe(50)
  })

  it("turns device off when price >= threshold", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "100.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([
      {
        id: "device-1",
        host: "192.168.1.1",
        port: 80,
        topic: null,
        connectionType: "http",
        threshold: "80.00",
        overrideActive: false,
        currentState: true,
      },
    ])

    await runAutomationCycle()

    expect(mockSendDeviceCommand).toHaveBeenCalledWith(
      expect.objectContaining({ command: "off", deviceId: "device-1" }),
    )
  })

  it("turns device on when price < threshold", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "30.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([
      {
        id: "device-2",
        host: "192.168.1.2",
        port: 80,
        topic: null,
        connectionType: "http",
        threshold: "80.00",
        overrideActive: false,
        currentState: false,
      },
    ])

    await runAutomationCycle()

    expect(mockSendDeviceCommand).toHaveBeenCalledWith(
      expect.objectContaining({ command: "on", deviceId: "device-2" }),
    )
  })

  it("skips device when overrideActive is true", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "100.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([
      {
        id: "device-3",
        host: "192.168.1.3",
        port: 80,
        topic: null,
        connectionType: "http",
        threshold: "50.00",
        overrideActive: true,
        currentState: true,
      },
    ])

    await runAutomationCycle()

    expect(mockSendDeviceCommand).not.toHaveBeenCalled()
  })

  it("skips device when threshold is null", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "100.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([
      {
        id: "device-4",
        host: "192.168.1.4",
        port: null,
        topic: null,
        connectionType: "http",
        threshold: null,
        overrideActive: false,
        currentState: false,
      },
    ])

    await runAutomationCycle()

    expect(mockSendDeviceCommand).not.toHaveBeenCalled()
  })

  it("does not toggle device when state already matches desired state", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "100.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([
      {
        id: "device-5",
        host: "192.168.1.5",
        port: 80,
        topic: null,
        connectionType: "http",
        threshold: "50.00",
        overrideActive: false,
        currentState: false,
      },
    ])

    await runAutomationCycle()

    expect(mockSendDeviceCommand).not.toHaveBeenCalled()
  })

  it("handles negative price without error", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "-10.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([
      {
        id: "device-6",
        host: "192.168.1.6",
        port: 80,
        topic: null,
        connectionType: "http",
        threshold: "50.00",
        overrideActive: false,
        currentState: false,
      },
    ])

    await runAutomationCycle()

    expect(mockSendDeviceCommand).toHaveBeenCalledWith(
      expect.objectContaining({ command: "on", deviceId: "device-6" }),
    )
  })

  it("broadcasts price_threshold_alert when price exceeds critical threshold", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "200.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([
      { userId: "user-1", criticalPriceThreshold: "150.00" },
    ])
    mockGetAllActiveDevices.mockResolvedValue([])

    await runAutomationCycle()

    const broadcastCalls = mockBroadcast.mock.calls
    const alertCall = broadcastCalls.find(
      (call) => (call[0] as { type: string }).type === "price_threshold_alert",
    )
    expect(alertCall).toBeDefined()
    expect((alertCall?.[0] as { data: { threshold: number } }).data.threshold).toBe(150)
  })

  it("does not broadcast threshold alert when price is below threshold", async () => {
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "100.00",
      timestamp: new Date("2026-01-01T12:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([
      { userId: "user-1", criticalPriceThreshold: "150.00" },
    ])
    mockGetAllActiveDevices.mockResolvedValue([])

    await runAutomationCycle()

    const broadcastCalls = mockBroadcast.mock.calls
    const alertCall = broadcastCalls.find(
      (call) => (call[0] as { type: string }).type === "price_threshold_alert",
    )
    expect(alertCall).toBeUndefined()
  })

  it("uses last known price when Elering API fails (fetchAndStorePrices does not throw)", async () => {
    mockFetchAndStorePrices.mockResolvedValue(undefined)
    mockGetCurrentPrice.mockResolvedValue({
      priceEurMwh: "75.00",
      timestamp: new Date("2026-01-01T11:00:00Z"),
    })
    mockGetAllSettingsWithThreshold.mockResolvedValue([])
    mockGetAllActiveDevices.mockResolvedValue([])

    await expect(runAutomationCycle()).resolves.toBeUndefined()

    const broadcastCalls = mockBroadcast.mock.calls
    const priceUpdateCall = broadcastCalls.find(
      (call) => (call[0] as { type: string }).type === "price_update",
    )
    expect(priceUpdateCall).toBeDefined()
  })
})
