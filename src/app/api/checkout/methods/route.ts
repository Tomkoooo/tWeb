import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";
import PaymentMethod from "@/models/PaymentMethod";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const [shippingMethods, paymentMethods] = await Promise.all([
      ShippingMethod.find({ isActive: true }).lean(),
      PaymentMethod.find({ isActive: true }).lean(),
    ]);

    return NextResponse.json({
      shippingMethods,
      paymentMethods,
    });
  } catch (error) {
    console.error("Checkout methods GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
