import { describe, expect, it } from "vitest"
import {
  normalizeBuyerEmail,
  summarizeEventSales,
} from "@wse/plugin-t-book/lib/event-sales-stats"

describe("summarizeEventSales", () => {
  it("returns an empty map for no rows", () => {
    expect(summarizeEventSales([]).size).toBe(0)
  })

  it("sums tickets and bookings and counts distinct buyers per event", () => {
    const stats = summarizeEventSales([
      { eventId: "e1", email: "a@x.hu", tickets: 3, bookings: 2 },
      { eventId: "e1", email: "b@x.hu", tickets: 1, bookings: 1 },
      { eventId: "e2", email: "a@x.hu", tickets: 4, bookings: 1 },
    ])
    expect(stats.get("e1")).toEqual({ ticketsSold: 4, bookingCount: 3, uniqueBuyers: 2 })
    expect(stats.get("e2")).toEqual({ ticketsSold: 4, bookingCount: 1, uniqueBuyers: 1 })
  })

  it("treats emails differing only in case or whitespace as one buyer", () => {
    const stats = summarizeEventSales([
      { eventId: "e1", email: "Anna@X.hu", tickets: 1, bookings: 1 },
      { eventId: "e1", email: " anna@x.hu ", tickets: 2, bookings: 1 },
    ])
    expect(stats.get("e1")).toEqual({ ticketsSold: 3, bookingCount: 2, uniqueBuyers: 1 })
  })

  it("normalizes missing emails to a single empty key", () => {
    expect(normalizeBuyerEmail(null)).toBe("")
    expect(normalizeBuyerEmail(undefined)).toBe("")
  })
})
