import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { shopCommerceBlockedResponse } from "@/lib/features/shop";
import { resolveAuthenticatedUserId } from "@/lib/auth-session-user";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = shopCommerceBlockedResponse();
    if (blocked) return blocked;
    const session = await auth();
    const userId = await resolveAuthenticatedUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const order = await Order.findOne({
      _id: id,
      user: new mongoose.Types.ObjectId(userId),
    })
      .populate("items.product")
      .populate("shippingMethod")
      .populate("paymentMethod")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Rendelés nem található" }, { status: 404 });
    }

    const safeOrder = {
      ...(order as any),
      invoiceDownloadUrl: `/api/user/orders/${id}/invoice`,
    };

    return NextResponse.json(safeOrder);
  } catch (error: any) {
    console.error("Error fetching order detail:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
