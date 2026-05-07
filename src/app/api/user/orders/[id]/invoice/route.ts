import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { InvoicingSzamlazzService } from "@/services/invoicing-szamlazz";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  const order = await Order.findOne({ _id: id, user: session.user.id }).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfBuffer = await InvoicingSzamlazzService.downloadInvoicePdf({
    invoiceId: (order as any).invoiceId,
    orderNumber: String(order._id),
    fallbackFileName: (order as any).invoicePdfFileName,
  });
  if (!pdfBuffer) {
    return NextResponse.json({ error: "Invoice PDF not found" }, { status: 404 });
  }

  const invoiceId = String((order as any).invoiceId || `invoice-${String(order._id).slice(-6)}`);
  const pdfBody = Uint8Array.from(pdfBuffer);

  return new NextResponse(pdfBody, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
