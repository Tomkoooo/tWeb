"use server"

/* eslint-disable @typescript-eslint/no-explicit-any -- legacy admin order actions handle dynamic Mongoose query/order shapes */
import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import { auth } from "@/auth"
import { MailerService } from "@/services/mailer"
import { GlsService } from "@/services/gls"
import { generateFoxpostShipment as generateFoxpostShipmentAction } from "@/actions/foxpost-shipment"
import mongoose from "mongoose"
import Product from "@/models/Product"
import {
  buildAdminOrdersMongoQuery,
  filterAdminOrders,
  type AdminOrderFilters,
} from "@/lib/admin-orders-query"
import { IOrder } from "@/models/Order"
import { MediaService } from "@/services/media"
import { OrderService } from "@/services/order"
import { formatOrderNumber } from "@/lib/order-number"
import {
  getOrderParcelProvider,
  orderNeedsParcelLabel,
} from "@/lib/parcel-locker"
import {
  isFoxpostParcelManagerEnabled,
  isGlsParcelManagerEnabled,
} from "@/lib/parcel-feature-flags"

const ORDER_STATUS_VALUES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const

type ParcelLabelActionResult = { success: true } | { success: false; error: string }

async function applyGlsLabelToOrder(
  order: InstanceType<typeof Order>,
  generatedByUserId?: string
): Promise<ParcelLabelActionResult> {
  try {
    const result = await GlsService.createLabelForOrder(order as unknown as IOrder)
    order.glsLabel = {
      ...(order.glsLabel || {}),
      parcelId: result.parcelId,
      parcelNumber: result.parcelNumber,
      parcelNumberWithCheckdigit: result.parcelNumberWithCheckdigit,
      pin: result.pin,
      labelDataBase64: result.labelDataBase64,
      labelUrl: `/api/admin/orders/${order._id.toString()}/gls-label`,
      generatedAt: new Date(),
      generatedBy: generatedByUserId
        ? new mongoose.Types.ObjectId(generatedByUserId)
        : undefined,
      lastError: undefined,
    }
    order.set("glsLabel.lastError", undefined)
    await order.save()
    await Order.updateOne({ _id: order._id }, { $unset: { "glsLabel.lastError": "" } })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A GLS címke létrehozása sikertelen."
    order.glsLabel = {
      ...(order.glsLabel || {}),
      lastError: message,
    }
    await order.save()
    return { success: false, error: message }
  }
}

async function applyFoxpostShipmentToOrder(
  order: InstanceType<typeof Order>,
  generatedByUserId?: string
): Promise<ParcelLabelActionResult> {
  void generatedByUserId;
  return generateFoxpostShipmentAction({ source: "live", id: order._id.toString() });
}
type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number]

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

function assertOrderStatus(status: string): asserts status is OrderStatusValue {
  if (!ORDER_STATUS_VALUES.includes(status as OrderStatusValue)) {
    throw new Error("Invalid order status")
  }
}

async function notifyOrderStatusChange(order: any, oldStatus: string, newStatus: string) {
  try {
    const customerEmail = order.user?.email || order.billingInfo?.email
    const customerName = order.user?.name || order.shippingAddress?.name

    if (customerEmail) {
      await MailerService.sendEmail({
        to: customerEmail,
        templateType: "order_status_change",
        data: {
          orderNumber: formatOrderNumber(order._id),
          customerName,
          oldStatus: getStatusLabel(oldStatus),
          newStatus: getStatusLabel(newStatus),
        }
      })
    }
  } catch (error) {
    console.error("Failed to send status change email:", error)
  }
}

async function applyOrderStatusChange(order: any, newStatus: OrderStatusValue) {
  const oldStatus = order.status
  if (oldStatus === newStatus) return false

  order.status = newStatus
  await order.save()
  await notifyOrderStatusChange(order, oldStatus, newStatus)
  return true
}

export type OrderFilters = AdminOrderFilters

export async function getOrderFilterProducts() {
  await checkAdmin()
  await dbConnect()
  const products = await Product.find({ deletedAt: null })
    .select("name")
    .sort({ name: 1 })
    .lean()

  return products.map((product) => ({
    id: product._id.toString(),
    name: product.name,
  }))
}

export async function getOrders(filters: OrderFilters = {}) {
  await checkAdmin()
  await dbConnect()
  const query = buildAdminOrdersMongoQuery(filters)
  const orders = JSON.parse(
    JSON.stringify(await Order.find(query).sort({ createdAt: -1 }))
  )
  return filterAdminOrders(orders, filters)
}

export async function getOrderById(id: string) {
  await checkAdmin()
  await dbConnect()
  return JSON.parse(JSON.stringify(await Order.findById(id).populate("user")))
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  await checkAdmin()
  await dbConnect()
  assertOrderStatus(newStatus)

  const order = await Order.findById(orderId).populate("user")
  if (!order) throw new Error("Order not found")

  await applyOrderStatusChange(order, newStatus)

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  
  return { success: true }
}

export async function bulkUpdateOrderStatuses(orderIds: string[], newStatus: string) {
  await checkAdmin()
  await dbConnect()
  assertOrderStatus(newStatus)

  const uniqueOrderIds = Array.from(
    new Set(
      orderIds
        .map((orderId) => String(orderId || "").trim())
        .filter((orderId) => mongoose.Types.ObjectId.isValid(orderId))
    )
  )

  if (uniqueOrderIds.length === 0) {
    throw new Error("No valid orders selected")
  }

  const orders = await Order.find({ _id: { $in: uniqueOrderIds } }).populate("user")
  let updatedCount = 0
  let skippedCount = 0

  for (const order of orders) {
    const changed = await applyOrderStatusChange(order, newStatus)
    if (changed) {
      updatedCount += 1
      revalidatePath(`/admin/orders/${order._id.toString()}`)
    } else {
      skippedCount += 1
    }
  }

  revalidatePath("/admin/orders")

  return {
    success: true,
    updatedCount,
    skippedCount,
    missingCount: uniqueOrderIds.length - orders.length,
  }
}

export async function generateOrderGlsLabel(orderId: string) {
  await checkAdmin()
  await dbConnect()

  const order = await Order.findById(orderId)
  if (!order) throw new Error("Order not found")
  if (!order.glsParcelPoint?.id) {
    throw new Error("Ehhez a rendeléshez nincs GLS csomagpont mentve.")
  }

  const session = await auth()
  const result = await applyGlsLabelToOrder(order, session?.user?.id)

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return result
}

export async function generateOrderFoxpostShipment(orderId: string) {
  return generateFoxpostShipmentAction({ source: "live", id: orderId });
}

export type BulkParcelLabelSkipReason =
  | "not_found"
  | "no_parcel_shipping"
  | "manager_disabled"
  | "label_exists"

export async function bulkGenerateParcelLabels(
  orderIds: string[],
  options?: { skipExisting?: boolean }
) {
  await checkAdmin()
  await dbConnect()

  const skipExisting = options?.skipExisting !== false
  const [glsManagerEnabled, foxpostManagerEnabled] = await Promise.all([
    isGlsParcelManagerEnabled(),
    isFoxpostParcelManagerEnabled(),
  ])

  const uniqueOrderIds = Array.from(
    new Set(
      orderIds
        .map((orderId) => String(orderId || "").trim())
        .filter((orderId) => mongoose.Types.ObjectId.isValid(orderId))
    )
  )

  if (uniqueOrderIds.length === 0) {
    throw new Error("No valid orders selected")
  }

  const session = await auth()
  const generatedByUserId = session?.user?.id

  const orders = await Order.find({ _id: { $in: uniqueOrderIds } })
  const ordersById = new Map(orders.map((order) => [order._id.toString(), order]))

  let successCount = 0
  let skippedCount = 0
  let failedCount = 0
  const failures: { orderId: string; error: string }[] = []
  const skips: { orderId: string; reason: BulkParcelLabelSkipReason }[] = []

  for (const orderId of uniqueOrderIds) {
    const order = ordersById.get(orderId)
    if (!order) {
      skippedCount += 1
      skips.push({ orderId, reason: "not_found" })
      continue
    }

    const provider = getOrderParcelProvider(order)
    if (!provider) {
      skippedCount += 1
      skips.push({ orderId, reason: "no_parcel_shipping" })
      continue
    }

    if (provider === "gls" && !glsManagerEnabled) {
      skippedCount += 1
      skips.push({ orderId, reason: "manager_disabled" })
      continue
    }

    if (provider === "foxpost" && !foxpostManagerEnabled) {
      skippedCount += 1
      skips.push({ orderId, reason: "manager_disabled" })
      continue
    }

    if (skipExisting && !orderNeedsParcelLabel(order)) {
      skippedCount += 1
      skips.push({ orderId, reason: "label_exists" })
      continue
    }

    const result =
      provider === "gls"
        ? await applyGlsLabelToOrder(order, generatedByUserId)
        : await applyFoxpostShipmentToOrder(order, generatedByUserId)

    if (result.success) {
      successCount += 1
      revalidatePath(`/admin/orders/${orderId}`)
    } else {
      failedCount += 1
      failures.push({ orderId, error: result.error })
    }
  }

  revalidatePath("/admin/orders")

  return {
    success: true,
    successCount,
    skippedCount,
    failedCount,
    failures,
    skips,
    missingCount: uniqueOrderIds.length - orders.length,
  }
}

export async function updateOrderInvoiceData(orderId: string, formData: FormData) {
  await checkAdmin()
  await dbConnect()

  const order = await Order.findById(orderId)
  if (!order) throw new Error("Order not found")

  const invoiceId = String(formData.get("invoiceId") || "").trim()
  const invoiceExternalId = String(formData.get("invoiceExternalId") || "").trim()
  const invoiceStatus = String(formData.get("invoiceStatus") || "").trim()
  const invoiceIssuedAtRaw = String(formData.get("invoiceIssuedAt") || "").trim()

  order.invoiceMode = invoiceId ? "manual" : "none"
  order.invoiceId = invoiceId || undefined
  order.invoiceExternalId = invoiceExternalId || undefined
  order.invoiceStatus = (invoiceStatus || (invoiceId ? "manual" : "pending")) as any
  order.invoiceIssuedAt = invoiceIssuedAtRaw ? new Date(invoiceIssuedAtRaw) : undefined
  if (invoiceId && !order.invoicePdfFileName) {
    order.invoiceLastError = "Nincs feltöltött manuális számla PDF."
  } else if (invoiceId) {
    order.invoiceLastError = undefined
  }
  await order.save()

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath(`/profile/orders/${orderId}`)
}

export async function uploadManualInvoicePdf(orderId: string, formData: FormData) {
  await checkAdmin()
  await dbConnect()
  const order = await Order.findById(orderId)
  if (!order) throw new Error("Order not found")

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Kérlek válassz PDF fájlt.")
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = await MediaService.processUpload(buffer, file.name, file.type || "application/pdf")
  await MediaService.incrementUsage(filename)

  if (order.invoicePdfFileName && order.invoicePdfFileName !== filename) {
    await MediaService.decrementUsage(order.invoicePdfFileName)
  }

  order.invoicePdfFileName = filename
  order.invoiceMode = "manual"
  order.invoiceStatus = order.invoiceId ? "manual" : "pending"
  await order.save()

  if (order.invoiceId) {
    await OrderService.sendInvoiceEmail(order, "invoice_sent", "Manuális számla feltöltve.");
  } else {
    await OrderService.sendInvoiceEmail(order, "invoice_issue", "A számla PDF feltöltve, de számlaszám még nincs mentve.");
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath(`/profile/orders/${orderId}`)
}

export async function resendOrderInvoiceEmail(orderId: string) {
  await checkAdmin()
  await dbConnect()
  const order = await Order.findById(orderId)
  if (!order) throw new Error("Order not found")

  if (order.invoiceId) {
    await OrderService.sendInvoiceEmail(order, "invoice_sent", "Számla újraküldve kérésre.");
  } else {
    await OrderService.sendInvoiceEmail(order, "invoice_issue", "A számla adatai hiányosak, manuális beavatkozás szükséges.");
  }

  revalidatePath(`/admin/orders/${orderId}`)
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Függőben",
    processing: "Feldolgozás alatt",
    shipped: "Szállítva",
    delivered: "Kézbesítve",
    cancelled: "Törölve"
  }
  return labels[status] || status
}
