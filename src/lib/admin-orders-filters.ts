/** Client-safe admin order filter types and helpers (no Mongoose). */

export type AdminOrderDeletedFilter = "active" | "deleted"

/** Orders marked cancelled are treated as deleted in admin workflows. */
export const ADMIN_ORDER_DELETED_STATUS = "cancelled"

export type AdminOrderFilters = {
  q?: string
  status?: string
  invoiceStatus?: string
  shippingType?: string
  dateFrom?: string
  dateTo?: string
  productId?: string
  /** active (default): hide cancelled. deleted: cancelled orders only. */
  deletedFilter?: AdminOrderDeletedFilter | string
  /** Smart filters resolved in-memory against order summaries. */
  unitsMin?: string
  unitsMax?: string
  kindsMin?: string
  kindsMax?: string
  totalMin?: string
  totalMax?: string
  labelState?: string
  billingType?: string
  mix?: string
  sort?: string
}

export function resolveAdminOrderDeletedFilter(
  filters: AdminOrderFilters = {}
): AdminOrderDeletedFilter {
  return filters.deletedFilter === "deleted" ? "deleted" : "active"
}

export function isAdminDeletedOrder(status?: string): boolean {
  return status === ADMIN_ORDER_DELETED_STATUS
}

export function parseAdminOrderFiltersFromSearchParams(
  searchParams: URLSearchParams
): AdminOrderFilters {
  const get = (key: keyof AdminOrderFilters) => searchParams.get(key) || undefined
  return {
    q: get("q"),
    status: get("status"),
    invoiceStatus: get("invoiceStatus"),
    shippingType: get("shippingType"),
    productId: get("productId"),
    dateFrom: get("dateFrom"),
    dateTo: get("dateTo"),
    deletedFilter: get("deletedFilter") as AdminOrderDeletedFilter | undefined,
    unitsMin: get("unitsMin"),
    unitsMax: get("unitsMax"),
    kindsMin: get("kindsMin"),
    kindsMax: get("kindsMax"),
    totalMin: get("totalMin"),
    totalMax: get("totalMax"),
    labelState: get("labelState"),
    billingType: get("billingType"),
    mix: get("mix"),
    sort: get("sort"),
  }
}
