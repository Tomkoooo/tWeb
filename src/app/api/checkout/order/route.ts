import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { OrderService } from "@/services/order";
import { FeatureFlagService } from "@/services/feature-flags";
import {
  STRIPE_FIXED_PAYMENT_METHOD_ID,
  validateAndNormalizeCheckoutInput,
} from "@/services/checkout-validation";
import { shopCommerceBlockedResponse } from "@/lib/features/shop";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  try {
    const commerceBlocked = shopCommerceBlockedResponse();
    if (commerceBlocked) return commerceBlocked;
    const isShopEnabled = await FeatureFlagService.isEnabled("shopPage", true);
    if (!isShopEnabled) {
      return NextResponse.json(
        { error: "Jelenleg a rendelés leadás szünetel" },
        { status: 503 }
      );
    }

    const payload = await req.json();
    if (payload?.paymentMethod === STRIPE_FIXED_PAYMENT_METHOD_ID) {
      return NextResponse.json(
        { error: "A Stripe fizetéshez a dedikált fizetési folyamatot kell használni." },
        { status: 400 }
      );
    }

    const validatedOrderData = await validateAndNormalizeCheckoutInput(payload, {
      userId: session?.user?.id,
      allowStripeFixed: false,
    });
    const order = await OrderService.createOrder(validatedOrderData, session?.user?.id);
    
    return NextResponse.json({ 
      success: true, 
      orderId: order._id 
    });
  } catch (error: any) {
    console.error("Order POST error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 400 });
  }
}
