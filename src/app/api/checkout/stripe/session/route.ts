import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Stripe from "stripe";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import TempOrder from "@/models/TempOrder";
import { FeatureFlagService } from "@/services/feature-flags";
import { validateAndNormalizeCheckoutInput } from "@/services/checkout-validation";
import { getAppBaseUrl, getStripeClient } from "@/services/stripe";
import { shopCommerceBlockedResponse } from "@/lib/features/shop";

export const runtime = "nodejs";

function toStripeHufAmount(amount: number): number {
  return Math.max(1, Math.round(Number(amount || 0) * 100));
}

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
    const stripeEnabled = await FeatureFlagService.isEnabled("stripePayments", false);
    if (!stripeEnabled) {
      return NextResponse.json(
        { error: "A Stripe fizetés jelenleg nem elérhető." },
        { status: 503 }
      );
    }

    const payload = await req.json();
    const validatedOrderData = await validateAndNormalizeCheckoutInput(payload, {
      userId: session?.user?.id,
      allowStripeFixed: true,
    });
    if (validatedOrderData.paymentProvider !== "stripe") {
      return NextResponse.json(
        { error: "A kiválasztott fizetési mód nem Stripe." },
        { status: 400 }
      );
    }

    await dbConnect();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
    const tempOrder = await TempOrder.create({
      user: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      checkoutData: validatedOrderData,
      paymentProvider: "stripe",
      status: "created",
      expiresAt,
    });

    const stripe = getStripeClient();
    const baseUrl = getAppBaseUrl();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validatedOrderData.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "huf",
        unit_amount: toStripeHufAmount(Number(item.price || 0)),
        product_data: {
          name: item.name || "Termék",
          description: item.variantLabel || undefined,
        },
      },
    }));
    if (validatedOrderData.shippingFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "huf",
          unit_amount: toStripeHufAmount(validatedOrderData.shippingFee),
          product_data: {
            name: "Szállítás",
            description: undefined,
          },
        },
      });
    }
    if (validatedOrderData.paymentFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "huf",
          unit_amount: toStripeHufAmount(validatedOrderData.paymentFee),
          product_data: {
            name: "Fizetési kezelési díj",
            description: undefined,
          },
        },
      });
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?tempOrderId=${tempOrder._id.toString()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?stripeCancelled=1`,
      client_reference_id: tempOrder._id.toString(),
      metadata: {
        tempOrderId: tempOrder._id.toString(),
        userId: session?.user?.id || "",
      },
      line_items: lineItems,
      payment_method_types: ["card"],
      locale: "hu",
    });

    await TempOrder.findByIdAndUpdate(tempOrder._id, {
      $set: {
        status: "checkout_started",
        stripeSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      tempOrderId: tempOrder._id,
    });
  } catch (error: any) {
    console.error("Stripe session POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Nem sikerült elindítani a Stripe fizetést." },
      { status: 400 }
    );
  }
}
