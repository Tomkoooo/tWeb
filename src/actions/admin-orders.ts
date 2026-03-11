"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import { auth } from "@/auth"
import { MailerService } from "@/services/mailer"
import { GlsService } from "@/services/gls"
import mongoose from "mongoose"
import { IOrder } from "@/models/Order"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function getOrders() {
  await checkAdmin()
  await dbConnect()
  return JSON.parse(JSON.stringify(await Order.find({}).sort({ createdAt: -1 })))
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
          orderNumber: order._id.toString().slice(-6).toUpperCase(),
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
