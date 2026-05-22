import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product"; // needed to populate products
import ShippingMethod from "@/models/ShippingMethod";
import PaymentMethod from "@/models/PaymentMethod";
import { shopCommerceBlockedResponse } from "@/lib/features/shop";
import { resolveAuthenticatedUserId } from "@/lib/auth-session-user";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const blocked = shopCommerceBlockedResponse();
    if (blocked) return blocked;
    const session = await auth();
    const userId = await resolveAuthenticatedUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const orders = await Order.find({ user: new mongoose.Types.ObjectId(userId) })
      .populate("items.product")
      .populate("shippingMethod")
      .populate("paymentMethod")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
