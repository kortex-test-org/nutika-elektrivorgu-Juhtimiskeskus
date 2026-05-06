import { beforeEach, describe, expect, it, mock } from "bun:test"

const mockGetSavingsConfig = mock(() => Promise.resolve(null))
const mockGetPricesByRange = mock(() => Promise.resolve([]))

mock.module("../src/db/repository/savings", () => ({
  getSavingsConfig: mockGetSavingsConfig,
  upsertSavingsConfig: mock(() => Promise.resolve(null)),
}))

mock.module("../src/db/repository/price", () => ({
  getPricesByRange: mockGetPricesByRange,
  getLatestPrice: mock(() => Promise.resolve(null)),
  upsertPrices: mock(() => Promise.resolve()),
}))

const { calculateSavings } = await import("../src/services/savings")

beforeEach(() => {
  mockGetSavingsConfig.mockClear()
  mockGetPricesByRange.mockClear()
})

const FIXED_RATE = "0.15"

describe("calculateSavings", () => {
  it("returns zero savings when no config exists", async () => {
    mockGetSavingsConfig.mockResolvedValue(null)

    const result = await calculateSavings("user-1", "day")

    expect(result.totalSavingsEur).toBe(0)
    expect(result.details).toHaveLength(0)
    expect(result.period).toBe("day")
  })

  it("returns zero savings when no price data for period", async () => {
    mockGetSavingsConfig.mockResolvedValue({ fixedRateEurKwh: FIXED_RATE })
    mockGetPricesByRange.mockResolvedValue([])

    const result = await calculateSavings("user-1", "week")

    expect(result.totalSavingsEur).toBe(0)
    expect(result.details).toHaveLength(0)
    expect(result.period).toBe("week")
  })

  it("calculates positive savings when exchange price is lower than fixed rate", async () => {
    mockGetSavingsConfig.mockResolvedValue({ fixedRateEurKwh: FIXED_RATE })
    mockGetPricesByRange.mockResolvedValue([
      {
        timestamp: new Date("2026-01-01T12:00:00Z"),
        priceEurMwh: "100.00",
      },
    ])

    const result = await calculateSavings("user-1", "day")

    const exchangePriceEurKwh = 100 / 1000
    const expectedSavings = 0.15 - exchangePriceEurKwh

    expect(result.totalSavingsEur).toBeCloseTo(expectedSavings, 4)
    expect(result.details).toHaveLength(1)
    expect(result.details[0].savingsEurKwh).toBeCloseTo(expectedSavings, 4)
  })

  it("calculates negative savings when exchange price is higher than fixed rate", async () => {
    mockGetSavingsConfig.mockResolvedValue({ fixedRateEurKwh: FIXED_RATE })
    mockGetPricesByRange.mockResolvedValue([
      {
        timestamp: new Date("2026-01-01T12:00:00Z"),
        priceEurMwh: "200.00",
      },
    ])

    const result = await calculateSavings("user-1", "day")

    const exchangePriceEurKwh = 200 / 1000
    const expectedSavings = 0.15 - exchangePriceEurKwh

    expect(result.totalSavingsEur).toBeCloseTo(expectedSavings, 4)
    expect(result.details[0].savingsEurKwh).toBeLessThan(0)
  })

  it("accumulates savings across multiple price entries", async () => {
    mockGetSavingsConfig.mockResolvedValue({ fixedRateEurKwh: FIXED_RATE })
    mockGetPricesByRange.mockResolvedValue([
      { timestamp: new Date("2026-01-01T10:00:00Z"), priceEurMwh: "100.00" },
      { timestamp: new Date("2026-01-01T11:00:00Z"), priceEurMwh: "120.00" },
      { timestamp: new Date("2026-01-01T12:00:00Z"), priceEurMwh: "80.00" },
    ])

    const result = await calculateSavings("user-1", "week")

    expect(result.details).toHaveLength(3)
    const expected = [100, 120, 80]
      .map((price) => 0.15 - price / 1000)
      .reduce((acc, val) => acc + val, 0)
    expect(result.totalSavingsEur).toBeCloseTo(expected, 4)
  })

  it("includes period in result for all periods", async () => {
    mockGetSavingsConfig.mockResolvedValue({ fixedRateEurKwh: FIXED_RATE })
    mockGetPricesByRange.mockResolvedValue([])

    const dayResult = await calculateSavings("user-1", "day")
    const weekResult = await calculateSavings("user-1", "week")
    const monthResult = await calculateSavings("user-1", "month")

    expect(dayResult.period).toBe("day")
    expect(weekResult.period).toBe("week")
    expect(monthResult.period).toBe("month")
  })

  it("includes exchangePriceEurKwh and fixedRateEurKwh in detail entries", async () => {
    mockGetSavingsConfig.mockResolvedValue({ fixedRateEurKwh: FIXED_RATE })
    mockGetPricesByRange.mockResolvedValue([
      { timestamp: new Date("2026-01-01T12:00:00Z"), priceEurMwh: "150.00" },
    ])

    const result = await calculateSavings("user-1", "day")

    expect(result.details[0].exchangePriceEurKwh).toBeCloseTo(0.15, 4)
    expect(result.details[0].fixedRateEurKwh).toBeCloseTo(0.15, 4)
  })
})
