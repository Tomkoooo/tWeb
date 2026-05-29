import type { CampPricingMode } from "../models/CampTicketType"

export function calculateCampTotalHuf(
  priceHuf: number,
  pricingMode: CampPricingMode,
  childCount: number
): number {
  const count = Math.max(1, childCount)
  if (pricingMode === "flat") {
    return Math.round(priceHuf)
  }
  return Math.round(priceHuf * count)
}

export function seatsRequiredForBooking(childCount: number): number {
  return Math.max(1, childCount)
}
