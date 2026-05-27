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
    const items = order.items?.length ? order.items : [null]

    for (const item of items) {
      if (!item) {
        rows.push({
          ...base,
          "Tétel termék ID": "",
          "Tétel név": "",
          "Tétel variáns ID": "",
          "Tétel variáns": "",
          "Tétel attribútumok": "",
          Mennyiség: "",
          "Egységár (bruttó)": "",
          "ÁFA %": "",
          "Tétel sorösszeg": "",
        })
        continue
      }

      const quantity = Number(item.quantity || 0)
      const unitPrice = Number(item.price || 0)
      rows.push({
        ...base,
        "Tétel termék ID": String(item.product || ""),
        "Tétel név": item.name || "",
        "Tétel variáns ID": item.variantId || "",
        "Tétel variáns": item.variantLabel || "",
        "Tétel attribútumok": stringifyAttributes(item.selectedAttributes),
        Mennyiség: quantity,
        "Egységár (bruttó)": unitPrice,
        "ÁFA %": item.vatPercent ?? "",
        "Tétel sorösszeg": quantity * unitPrice,
      })
    }
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
