import { NextRequest, NextResponse } from "next/server";
import TempOrder from "@/models/TempOrder";
import dbConnect from "@/lib/db";
import { CheckoutFinalizationService } from "@/services/checkout-finalization";
import { getStripeClient, getStripeWebhookSecret } from "@/services/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeClient();
    const webhookSecret = getStripeWebhookSecret();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
    }

    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    await dbConnect();

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const checkoutSession = event.data.object as any;
      const sessionId = checkoutSession.id;
      const paymentIntentId =
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id;

      const tempOrder = await TempOrder.findOneAndUpdate(
        {
          stripeSessionId: sessionId,
          status: { $in: ["created", "checkout_started", "paid", "finalizing"] },
        },
        {
          $set: {
            status: "paid",
            stripePaymentIntentId: paymentIntentId || undefined,
          },
        },
        { new: true }
      ).lean();

      const tempOrderId = tempOrder?._id?.toString() || checkoutSession.metadata?.tempOrderId;
      if (tempOrderId) {
        try {
          await CheckoutFinalizationService.finalizeFromTempOrder(tempOrderId);
        } catch (finalizeError) {
          console.error("Stripe webhook finalization error:", finalizeError);
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const checkoutSession = event.data.object as any;
      await TempOrder.findOneAndUpdate(
        { stripeSessionId: checkoutSession.id, status: { $in: ["created", "checkout_started"] } },
        { $set: { status: "expired" } }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 400 });
  }
}
