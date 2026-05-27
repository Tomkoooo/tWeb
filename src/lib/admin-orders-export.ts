import { format } from "date-fns"
import { formatOrderNumber } from "@/lib/order-number"
import { getOrderShippingTypeLabel } from "@/lib/parcel-locker"
import type { AdminOrderFilters } from "@/lib/admin-orders-query"

type PopulatedMethod = { name?: string } | string | null | undefined

type ExportOrder = {
  _id: unknown
  createdAt?: Date | string
  updatedAt?: Date | string
  status?: string
  user?: { email?: string; name?: string } | null
  billingInfo?: Record<string, unknown>
  shippingAddress?: Record<string, unknown>
  glsParcelPoint?: Record<string, unknown> | null
  foxpostParcelPoint?: Record<string, unknown> | null
  glsLabel?: { parcelNumber?: string; parcelNumberWithCheckdigit?: string; pin?: string } | null
  foxpostShipment?: { clFoxId?: string; refCode?: string; trackingStatus?: string } | null
  shippingMethod?: PopulatedMethod
  paymentMethod?: PopulatedMethod
  couponCodes?: string[]
  subtotal?: number
  shippingFee?: number
  paymentFee?: number
  discount?: number
  total?: number
  invoiceMode?: string
  invoiceId?: string
  invoiceExternalId?: string
  invoiceStatus?: string
  invoiceIssuedAt?: Date | string
  invoiceLastError?: string
  items?: Array<{
    product?: unknown
    variantId?: string
    variantLabel?: string
    selectedAttributes?: Record<string, string>
    name?: string
    price?: number
    quantity?: number
    vatPercent?: number
  }>
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Függőben",
  processing: "Feldolgozás alatt",
  shipped: "Szállítva",
  delivered: "Kézbesítve",
  cancelled: "Törölve",
}

function formatDateTime(value: unknown): string {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return ""
  return format(date, "yyyy-MM-dd HH:mm:ss")
}

function methodName(method: PopulatedMethod): string {
  if (!method) return ""
  if (typeof method === "string") return method
  return String(method.name || "")
}

function stringifyAttributes(attrs: Record<string, string> | undefined): string {
  if (!attrs || typeof attrs !== "object") return ""
  return Object.entries(attrs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")
}

const MAX_ITEM_COLS = 12

function addItemsAsColumns(
  row: Record<string, string | number>,
  items: ExportOrder["items"] | undefined
): Record<string, string | number> {
  const safeItems = Array.isArray(items) ? items : []
  row["Tételek száma"] = safeItems.length

  row["Tételek (összegzés)"] = safeItems
    .map((item) => {
      const name = String(item?.name || "").trim()
      const qty = Number(item?.quantity || 0)
      const unit = Number(item?.price || 0)
      const variant = String(item?.variantLabel || "").trim()
      const attrs = stringifyAttributes(item?.selectedAttributes)
      const details = [variant, attrs].filter(Boolean).join(" | ")
      const label = details ? `${name} (${details})` : name
      return `${label} × ${qty} @ ${unit}`
    })
    .filter(Boolean)
    .join(" || ")

  for (let i = 0; i < MAX_ITEM_COLS; i += 1) {
    const item = safeItems[i]
    const n = i + 1
    row[`Tétel ${n} termék ID`] = item?.product != null ? String(item.product) : ""
    row[`Tétel ${n} név`] = item?.name || ""
    row[`Tétel ${n} variáns ID`] = item?.variantId || ""
    row[`Tétel ${n} variáns`] = item?.variantLabel || ""
    row[`Tétel ${n} attribútumok`] = stringifyAttributes(item?.selectedAttributes)
    row[`Tétel ${n} mennyiség`] = item?.quantity != null ? Number(item.quantity || 0) : ""
    row[`Tétel ${n} egységár (bruttó)`] = item?.price != null ? Number(item.price || 0) : ""
    row[`Tétel ${n} ÁFA %`] = item?.vatPercent ?? ""
    if (item?.quantity != null && item?.price != null) {
      const q = Number(item.quantity || 0)
      const p = Number(item.price || 0)
      row[`Tétel ${n} sorösszeg`] = q * p
    } else {
      row[`Tétel ${n} sorösszeg`] = ""
    }
  }

  return row
}

function baseOrderRow(order: ExportOrder) {
  const billing = order.billingInfo || {}
  const shipping = order.shippingAddress || {}
  const gls = order.glsParcelPoint || {}
  const foxpost = order.foxpostParcelPoint || {}

  return {
    "Rendelés azonosító": String(order._id || ""),
    "Rendelés szám": formatOrderNumber(order._id),
    Létrehozva: formatDateTime(order.createdAt),
    Frissítve: formatDateTime(order.updatedAt),
    Státusz: STATUS_LABELS[String(order.status || "")] || String(order.status || ""),
    "Regisztrált felhasználó email": order.user?.email || "",
    "Regisztrált felhasználó név": order.user?.name || "",
    "Számlázás típus": String(billing.type || ""),
    "Számlázási név": String(billing.name || ""),
    "Számlázási email": String(billing.email || ""),
    "Számlázási telefon": String(billing.phone || ""),
    Adószám: String(billing.taxNumber || ""),
    "Számlázási ország": String(billing.country || ""),
    "Számlázási irányítószám": String(billing.zip || ""),
    "Számlázási város": String(billing.city || ""),
    "Számlázási cím": String(billing.street || ""),
    "Szállítási név": String(shipping.name || ""),
    "Szállítási email": String(shipping.email || ""),
    "Szállítási telefon": String(shipping.phone || ""),
    "Szállítási ország": String(shipping.country || ""),
    "Szállítási irányítószám": String(shipping.zip || ""),
    "Szállítási város": String(shipping.city || ""),
    "Szállítási cím": String(shipping.street || ""),
    "Szállítási megjegyzés": String(shipping.comment || ""),
    "Szállítás típusa": getOrderShippingTypeLabel(order),
    "Szállítási mód": methodName(order.shippingMethod),
    "Fizetési mód": methodName(order.paymentMethod),
    "GLS csomagpont ID": String(gls.id || ""),
    "GLS csomagpont név": String(gls.name || ""),
    "Foxpost automata ID": String(foxpost.id || ""),
    "Foxpost automata név": String(foxpost.name || ""),
    "Foxpost cím": String(foxpost.address || ""),
    "GLS csomagszám": order.glsLabel?.parcelNumber || order.glsLabel?.parcelNumberWithCheckdigit || "",
    "GLS PIN": order.glsLabel?.pin || "",
    "Foxpost azonosító": order.foxpostShipment?.clFoxId || "",
    "Foxpost ref": order.foxpostShipment?.refCode || "",
    "Foxpost státusz": order.foxpostShipment?.trackingStatus || "",
    Kuponok: (order.couponCodes || []).join(", "),
    Részösszeg: order.subtotal ?? "",
    "Szállítási díj": order.shippingFee ?? "",
    "Fizetési díj": order.paymentFee ?? "",
    Kedvezmény: order.discount ?? "",
    Összesen: order.total ?? "",
    "Számla mód": order.invoiceMode || "",
    Számlaszám: order.invoiceId || "",
    "Számla külső ID": order.invoiceExternalId || "",
    "Számla státusz": order.invoiceStatus || "",
    "Számla kiállítva": formatDateTime(order.invoiceIssuedAt),
    "Számla hiba": order.invoiceLastError || "",
  }
}

export function buildAdminOrdersExportRows(orders: ExportOrder[]) {
  const rows: Record<string, string | number>[] = []

  for (const order of orders) {
    const base = baseOrderRow(order)
    const row = addItemsAsColumns({ ...base }, order.items)
    rows.push(row)
  }

  return rows
}

export async function buildAdminOrdersExcelBuffer(
  orders: ExportOrder[],
  filters: AdminOrderFilters = {}
) {
  const XLSX = await import("xlsx")
  const rows = buildAdminOrdersExportRows(orders)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rendelések")

  const metaRows = [
    ["Exportálva", format(new Date(), "yyyy-MM-dd HH:mm:ss")],
    ["Státusz szűrő", filters.status || "all"],
    ["Számla szűrő", filters.invoiceStatus || "all"],
    ["Szállítás szűrő", filters.shippingType || "all"],
    ["Termék szűrő", filters.productId || "all"],
    ["Dátumtól", filters.dateFrom || ""],
    ["Dátumig", filters.dateTo || ""],
    ["Keresés", filters.q || ""],
    ["Sorok száma", rows.length],
  ]
  const metaSheet = XLSX.utils.aoa_to_sheet(metaRows)
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Szűrők")

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}
