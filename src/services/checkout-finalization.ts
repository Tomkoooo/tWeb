import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import TempOrder from "@/models/TempOrder";
import Order from "@/models/Order";
import { OrderService } from "@/services/order";

export class CheckoutFinalizationService {
  static async finalizeFromTempOrder(tempOrderId: string) {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(tempOrderId)) {
      throw new Error("Érvénytelen ideiglenes rendelés azonosító");
    }

    const existing = await TempOrder.findById(tempOrderId).lean();
    if (!existing) {
      throw new Error("Az ideiglenes rendelés nem található");
    }

    if (existing.status === "finalized" && existing.finalizedOrderId) {
      const order = await Order.findById(existing.finalizedOrderId).lean();
      return { status: "finalized", order };
    }

    // Acquire idempotent finalization lock.
    const locked = await TempOrder.findOneAndUpdate(
      {
        _id: existing._id,
        status: "paid",
        finalizedOrderId: { $exists: false },
      },
      {
        $set: {
          status: "finalizing",
          lastError: undefined,
        },
      },
      { returnDocument: "after" }
    );

    if (!locked) {
      const latest = await TempOrder.findById(existing._id).lean();
      if (!latest) return { status: "missing" as const };
      if (latest.status === "finalized" && latest.finalizedOrderId) {
        const order = await Order.findById(latest.finalizedOrderId).lean();
        return { status: "finalized" as const, order };
      }
      return { status: latest.status as any };
    }

    try {
      const createdOrder = await OrderService.createOrderFromCheckoutData(
        locked.checkoutData,
        locked.user?.toString(),
        { enforceShopEnabled: false, skipStockDecrement: true }
      );

      await TempOrder.findByIdAndUpdate(locked._id, {
        $set: {
          status: "finalized",
          finalizedOrderId: createdOrder._id,
          guestAccessToken: createdOrder.guestAccessToken,
          lastError: undefined,
        },
      });

      return { status: "finalized" as const, order: createdOrder };
    } catch (error: any) {
      await TempOrder.findByIdAndUpdate(locked._id, {
        $set: {
          status: "paid",
          lastError: error?.message || "Finalization failed",
        },
      });
      throw error;
    }
  }
}
