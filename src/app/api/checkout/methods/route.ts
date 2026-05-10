import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";
import PaymentMethod from "@/models/PaymentMethod";
import { shopCommerceBlockedResponse } from "@/lib/features/shop";
import { FeatureFlagService } from "@/services/feature-flags";
import { resolveConfiguredGlsShippingMethod } from "@/services/gls-shipping";
import { GLS_FIXED_SHIPPING_METHOD_ID } from "@/lib/gls";

type CheckoutMethodRow = {
  _id: { toString: () => string };
  name: string;
  grossPrice: number;
  isActive: boolean;
};

export async function GET(_req: NextRequest) {
  try {
    const blocked = shopCommerceBlockedResponse();
    if (blocked) return blocked;
    const isShopEnabled = await FeatureFlagService.isEnabled("shopPage", true);
    const stripeEnabled = await FeatureFlagService.isEnabled("stripePayments", false);
    const glsParcelPickerEnabled = await FeatureFlagService.isEnabled("glsParcelPicker", false);
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

    const normalizedShippingMethods = (shippingMethods as CheckoutMethodRow[]).map((method) => ({
      ...method,
      _id: method._id.toString(),
      provider: "standard",
      isFixed: false,
    }));

    if (glsParcelPickerEnabled) {
      const configuredGlsMethod = await resolveConfiguredGlsShippingMethod({ requireActive: true });
      if (configuredGlsMethod) {
        normalizedShippingMethods.unshift({
          _id: GLS_FIXED_SHIPPING_METHOD_ID,
          name: configuredGlsMethod.name,
          grossPrice: configuredGlsMethod.grossPrice,
          isActive: true,
          provider: "gls",
          isFixed: true,
        });
      }
    }

    const normalizedPaymentMethods = (paymentMethods as CheckoutMethodRow[]).map((method) => ({
      ...method,
      _id: method._id.toString(),
      provider: "standard",
      isFixed: false,
    }));

    if (stripeEnabled) {
      normalizedPaymentMethods.unshift({
        _id: "stripe_fixed",
        name: "Bankkártya (Stripe)",
        grossPrice: 0,
        isActive: true,
        provider: "stripe",
        isFixed: true,
      });
    }

    return NextResponse.json({
      shippingMethods: normalizedShippingMethods,
      paymentMethods: normalizedPaymentMethods,
    });
  } catch (error) {
    console.error("Checkout methods GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
