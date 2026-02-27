"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import { auth } from "@/auth"
import { MailerService } from "@/services/mailer"

async function checkAdmin() {
  const session = await auth()
  // @ts-ignore
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
