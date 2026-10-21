/** Booking statuses that count as a completed sale in admin stats. */
export const SOLD_BOOKING_STATUSES = ["paid", "confirmed"] as const

export type EventSalesStats = {
  /** Sum of `guests` (tickets / entries) on sold bookings. */
  ticketsSold: number
  /** Number of sold bookings (orders). */
  bookingCount: number
  /** Distinct buyers, keyed by normalized customer email. */
  uniqueBuyers: number
}

/** One aggregation row: sold bookings of one event grouped by raw customer email. */
export type EventSalesBuyerRow = {
  eventId: string
  email: string | null | undefined
  tickets: number
  bookings: number
}

export const EMPTY_EVENT_SALES: EventSalesStats = {
  ticketsSold: 0,
  bookingCount: 0,
  uniqueBuyers: 0,
}

export function normalizeBuyerEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase()
}

/**
 * Fold per-(event, email) rows into per-event stats.
 * Emails differing only in case/whitespace count as one buyer.
 */
export function summarizeEventSales(rows: EventSalesBuyerRow[]): Map<string, EventSalesStats> {
  const tickets = new Map<string, number>()
  const bookings = new Map<string, number>()
  const buyers = new Map<string, Set<string>>()

  for (const row of rows) {
    const eventId = row.eventId
    tickets.set(eventId, (tickets.get(eventId) ?? 0) + (Number(row.tickets) || 0))
    bookings.set(eventId, (bookings.get(eventId) ?? 0) + (Number(row.bookings) || 0))
    const set = buyers.get(eventId) ?? new Set<string>()
    set.add(normalizeBuyerEmail(row.email))
    buyers.set(eventId, set)
  }

  const result = new Map<string, EventSalesStats>()
  for (const eventId of tickets.keys()) {
    result.set(eventId, {
      ticketsSold: tickets.get(eventId) ?? 0,
      bookingCount: bookings.get(eventId) ?? 0,
      uniqueBuyers: buyers.get(eventId)?.size ?? 0,
    })
  }
  return result
}
