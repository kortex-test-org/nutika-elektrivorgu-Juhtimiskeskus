export type PriceUnit = "mwh" | "kwh"

export const formatPrice = (priceMwh: number, unit: PriceUnit, precision?: number) => {
  if (unit === "kwh") {
    const value = priceMwh / 1000
    return {
      value: value.toFixed(precision ?? 3),
      unit: "EUR/kWh",
    }
  }
  return {
    value: priceMwh.toFixed(precision ?? 2),
    unit: "EUR/MWh",
  }
}

export const convertToMwh = (value: number, unit: PriceUnit) => {
  return unit === "kwh" ? value * 1000 : value
}

export const convertFromMwh = (value: number, unit: PriceUnit) => {
  return unit === "kwh" ? value / 1000 : value
}
