import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";
import PaymentMethod from "@/models/PaymentMethod";
import { FeatureFlagService } from "@/services/feature-flags";

export async function GET(req: NextRequest) {
  try {
    const isShopEnabled = await FeatureFlagService.isEnabled("shopPage", true);
    if (!isShopEnabled) {
      return NextResponse.json(
        { error: "Jelenleg a rendelés leadás szünetel" },
        { status: 503 }
      );
    }

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
