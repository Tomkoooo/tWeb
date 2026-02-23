import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const order = await Order.findOne({ _id: id, user: session.user.id })
      .populate("items.product")
      .populate("shippingMethod")
      .populate("paymentMethod")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Rendelés nem található" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error fetching order detail:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
