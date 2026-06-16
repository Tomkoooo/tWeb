import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
// Ensure populated models are registered in this route bundle.
import "@/models/User"
import "@/models/ShippingMethod"
import "@/models/PaymentMethod"
import { format } from "date-fns"
import {
  buildAdminOrdersMongoQuery,
  filterAdminOrders,
  parseAdminOrderFiltersFromSearchParams,
} from "@/lib/admin-orders-query"
import { buildAdminOrdersExcelBuffer } from "@/lib/admin-orders-export"

function parseFilters(searchParams: URLSearchParams) {
  return parseAdminOrderFiltersFromSearchParams(searchParams)
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const filters = parseFilters(request.nextUrl.searchParams)
    await dbConnect()

    const query = buildAdminOrdersMongoQuery(filters)
    const rawOrders = await Order.find(query)
      .populate("user", "name email")
      .populate("shippingMethod", "name")
      .populate("paymentMethod", "name")
      .sort({ createdAt: -1 })
      .lean()

    const orders = filterAdminOrders(JSON.parse(JSON.stringify(rawOrders)), filters)
    const buffer = await buildAdminOrdersExcelBuffer(orders, filters)
    const filename = `rendelesek-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[admin/orders/export]", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
