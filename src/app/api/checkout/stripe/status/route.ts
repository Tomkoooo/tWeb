import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import TempOrder from "@/models/TempOrder";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tempOrderId = searchParams.get("tempOrderId");
    const sessionId = searchParams.get("session_id");

    if (!tempOrderId || !mongoose.Types.ObjectId.isValid(tempOrderId)) {
      return NextResponse.json({ error: "Hiányzó vagy érvénytelen tempOrderId" }, { status: 400 });
    }

    await dbConnect();
    const tempOrder = await TempOrder.findById(tempOrderId).lean();
    if (!tempOrder) {
      return NextResponse.json({ error: "Az ideiglenes rendelés nem található" }, { status: 404 });
    }
    if (sessionId && tempOrder.stripeSessionId && sessionId !== tempOrder.stripeSessionId) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 400 });
    }

    return NextResponse.json({
      status: tempOrder.status,
      finalized: tempOrder.status === "finalized",
      orderId: tempOrder.finalizedOrderId || null,
      lastError: tempOrder.lastError || null,
    });
  } catch (error: any) {
    console.error("Stripe status GET error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
