"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import { auth } from "@/auth"
import { MailerService } from "@/services/mailer"
import { GlsService } from "@/services/gls"
import { FoxpostService } from "@/services/foxpost"
import {
  matchesOrderShippingTypeFilter,
  type OrderShippingTypeFilter,
} from "@/lib/parcel-locker"
import mongoose from "mongoose"
import { IOrder } from "@/models/Order"
import { MediaService } from "@/services/media"
import { OrderService } from "@/services/order"
import { formatOrderNumber } from "@/lib/order-number"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

type OrderFilters = {
  q?: string
  status?: string
  invoiceStatus?: string
  shippingType?: string
  dateFrom?: string
  dateTo?: string
}

export async function getOrders(filters: OrderFilters = {}) {
  await checkAdmin()
  await dbConnect()
  const query: Record<string, any> = {}
  if (filters.status && filters.status !== "all") query.status = filters.status
  if (filters.invoiceStatus && filters.invoiceStatus !== "all") query.invoiceStatus = filters.invoiceStatus
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {}
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom)
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      dateTo.setHours(23, 59, 59, 999)
      query.createdAt.$lte = dateTo
    }
  }

  let orders = JSON.parse(JSON.stringify(await Order.find(query).sort({ createdAt: -1 })))

  const shippingType = (filters.shippingType || "all") as OrderShippingTypeFilter
  if (shippingType !== "all") {
    orders = orders.filter((order: any) => matchesOrderShippingTypeFilter(order, shippingType))
  }

  const search = String(filters.q || "").trim().toLowerCase()
  if (!search) return orders

  return orders.filter((order: any) => {
    const haystack = [
      formatOrderNumber(order._id),
      order._id,
      order.billingInfo?.name,
      order.billingInfo?.email,
      order.billingInfo?.phone,
      order.shippingAddress?.name,
      order.shippingAddress?.email,
      order.shippingAddress?.phone,
      order.shippingAddress?.city,
      order.invoiceId,
      ...(order.items || []).map((item: any) => item.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(search)
  })
}

export async function getOrderById(id: string) {
  await checkAdmin()
  await dbConnect()
  return JSON.parse(JSON.stringify(await Order.findById(id).populate("user")))
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  await checkAdmin()
  await dbConnect()

  const order = await Order.findById(orderId).populate("user")
  if (!order) throw new Error("Order not found")

  const oldStatus = order.status
  order.status = newStatus
  await order.save()

  // Trigger Email Notification
  try {
    const customerEmail = order.user?.email || order.billingInfo?.email // Assuming email might be in billingInfo too if guest
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

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  
  return { success: true }
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
      generatedBy: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      lastError: undefined,
    }
    await order.save()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A GLS címke létrehozása sikertelen."
    order.glsLabel = {
      ...(order.glsLabel || {}),
      lastError: message,
    }
    await order.save()
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: false, error: message }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

export async function generateOrderFoxpostShipment(orderId: string) {
  await checkAdmin()
  await dbConnect()

  const order = await Order.findById(orderId)
  if (!order) throw new Error("Order not found")
  if (!order.foxpostParcelPoint?.id) {
    throw new Error("Ehhez a rendeléshez nincs Foxpost csomagautomata mentve.")
  }

  const session = await auth()

  let clFoxId = order.foxpostShipment?.clFoxId
  let refCode = order.foxpostShipment?.refCode

  try {
    if (!clFoxId) {
      const created = await FoxpostService.createParcelForOrder(order as unknown as IOrder)
      clFoxId = created.clFoxId || created.barcode
      refCode = created.refCode || order._id.toString().slice(-30)
      if (!clFoxId) {
        throw new Error("Foxpost csomag azonosító hiányzik a létrehozás után.")
      }
      order.foxpostShipment = {
        ...(order.foxpostShipment || {}),
        clFoxId,
        refCode,
        lastError: undefined,
      }
      await order.save()
    }

    const result = await FoxpostService.createShipmentForOrder(order as unknown as IOrder)
    order.foxpostShipment = {
      ...(order.foxpostShipment || {}),
      clFoxId: result.clFoxId,
      refCode: result.refCode || refCode,
      labelDataBase64: result.labelDataBase64,
      labelPageSize: result.labelPageSize,
      trackingStatus: result.trackingStatus,
      labelUrl: `/api/admin/orders/${order._id.toString()}/foxpost-label`,
      generatedAt: new Date(),
      generatedBy: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      lastError: undefined,
    }
    await order.save()
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "A Foxpost csomag/címke létrehozása sikertelen."
    order.foxpostShipment = {
      ...(order.foxpostShipment || {}),
      clFoxId: clFoxId || order.foxpostShipment?.clFoxId,
      refCode: refCode || order.foxpostShipment?.refCode,
      lastError: message,
    }
    await order.save()
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: false, error: message }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
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
