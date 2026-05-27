import mongoose from "mongoose"
import {
  matchesOrderShippingTypeFilter,
  type OrderShippingTypeFilter,
} from "@/lib/parcel-locker"
import { formatOrderNumber } from "@/lib/order-number"

export type AdminOrderFilters = {
  q?: string
  status?: string
  invoiceStatus?: string
  shippingType?: string
  dateFrom?: string
  dateTo?: string
  productId?: string
}

export function buildAdminOrdersMongoQuery(filters: AdminOrderFilters = {}): Record<string, unknown> {
  const query: Record<string, unknown> = {}

  if (filters.status && filters.status !== "all") {
    query.status = filters.status
  }
  if (filters.invoiceStatus && filters.invoiceStatus !== "all") {
    query.invoiceStatus = filters.invoiceStatus
  }
  if (filters.productId && filters.productId !== "all") {
    if (mongoose.Types.ObjectId.isValid(filters.productId)) {
      query["items.product"] = new mongoose.Types.ObjectId(filters.productId)
    }
  }
  if (filters.dateFrom || filters.dateTo) {
    const createdAt: Record<string, Date> = {}
    if (filters.dateFrom) {
      createdAt.$gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      dateTo.setHours(23, 59, 59, 999)
      createdAt.$lte = dateTo
    }
    query.createdAt = createdAt
  }

  return query
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- admin order snapshots are dynamic JSON
export function filterAdminOrders(orders: any[], filters: AdminOrderFilters = {}): any[] {
  let result = orders

  const shippingType = (filters.shippingType || "all") as OrderShippingTypeFilter
  if (shippingType !== "all") {
    result = result.filter((order) =>
      matchesOrderShippingTypeFilter(
        order as {
          glsParcelPoint?: { id?: string } | null
          foxpostParcelPoint?: { id?: string } | null
        },
        shippingType
      )
    )
  }

  const search = String(filters.q || "").trim().toLowerCase()
  if (!search) return result

  return result.filter((order) => {
    const items = Array.isArray(order.items) ? order.items : []
    const haystack = [
      formatOrderNumber(order._id),
      order._id,
      (order.billingInfo as { name?: string } | undefined)?.name,
      (order.billingInfo as { email?: string } | undefined)?.email,
      (order.billingInfo as { phone?: string } | undefined)?.phone,
      (order.shippingAddress as { name?: string } | undefined)?.name,
      (order.shippingAddress as { email?: string } | undefined)?.email,
      (order.shippingAddress as { phone?: string } | undefined)?.phone,
      (order.shippingAddress as { city?: string } | undefined)?.city,
      order.invoiceId,
      ...items.map((item: { name?: string }) => item.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(search)
  })
}
