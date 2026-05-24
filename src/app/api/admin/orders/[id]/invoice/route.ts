import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { formatOrderNumber } from "@/lib/order-number";
import { InvoicingSzamlazzService, invoiceDownloadParamsForOrder } from "@/services/invoicing-szamlazz";
import { shopCommerceBlockedResponse } from "@/lib/features/shop";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = shopCommerceBlockedResponse();
  if (blocked) return blocked;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  const order = await Order.findById(id).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfBuffer = await InvoicingSzamlazzService.downloadInvoicePdf(
    invoiceDownloadParamsForOrder(order as { _id: unknown; invoiceId?: string; invoicePdfFileName?: string })
  );
  if (!pdfBuffer) {
    return NextResponse.json({ error: "Invoice PDF not found" }, { status: 404 });
  }

  const invoiceId = String((order as any).invoiceId || `invoice-${formatOrderNumber(order._id)}`);
  const pdfBody = Uint8Array.from(pdfBuffer);

  return new NextResponse(pdfBody, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
