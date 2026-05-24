import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { shopCommerceBlockedResponse } from "@/lib/features/shop";
import { InvoicingSzamlazzService } from "@/services/invoicing-szamlazz";
import { OrderGuestAccessService } from "@/services/order-guest-access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = shopCommerceBlockedResponse();
  if (blocked) return blocked;

  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Hiányzó hozzáférési token." }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Érvénytelen rendelés azonosító." }, { status: 400 });
  }

  const valid = await OrderGuestAccessService.verifyToken(id, token);
  if (!valid) {
    return NextResponse.json({ error: "A link érvénytelen vagy lejárt." }, { status: 403 });
  }

  await dbConnect();
  const order = await Order.findById(id).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfBuffer = await InvoicingSzamlazzService.downloadInvoicePdf({
    invoiceId: (order as { invoiceId?: string }).invoiceId,
    orderNumber: String(order._id),
    fallbackFileName: (order as { invoicePdfFileName?: string }).invoicePdfFileName,
  });
  if (!pdfBuffer) {
    return NextResponse.json({ error: "Invoice PDF not found" }, { status: 404 });
  }

  const invoiceId = String((order as { invoiceId?: string }).invoiceId || `invoice-${String(order._id).slice(-6)}`);
  const pdfBody = Uint8Array.from(pdfBuffer);

  return new NextResponse(pdfBody, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
