import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import mongoose from "mongoose";
import { MailerService } from "./mailer";
import { FeatureFlagService } from "./feature-flags";

export class OrderService {
  static async createOrder(orderData: any, userId?: string) {
    return this.createOrderFromCheckoutData(orderData, userId, { enforceShopEnabled: true });
  }

  static async createOrderFromCheckoutData(
    orderData: any,
    userId?: string,
    options?: { enforceShopEnabled?: boolean }
  ) {
    if (options?.enforceShopEnabled !== false) {
      const isShopEnabled = await FeatureFlagService.isEnabled("shopPage", true);
      if (!isShopEnabled) {
        throw new Error("Jelenleg a rendelés leadás szünetel");
      }
    }
    await dbConnect();

    await this.validateAndUpdateStock(orderData);

    // 2. Create the order
    const order = new Order({
      ...orderData,
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    });
    await order.save();

    // 3. Clear the cart if user is logged in
    await this.clearUserCart(userId);

    // 4. Trigger side effects after successful persistence
    await this.sendOrderConfirmation(order, orderData);
    await this.tryIssueInvoice(order);

    return order;
  }

  private static async validateAndUpdateStock(orderData: any) {
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);
      if (!product.isActive || !product.isVisible) throw new Error(`${product.name} is no longer available`);
      const hasVariants = Array.isArray((product as any).variants) && (product as any).variants.length > 0;
      const requireVariantSelection = Boolean((product as any).requireVariantSelection) && hasVariants;

      if (item.variantId) {
        if (!hasVariants) {
          throw new Error(`Érvénytelen variáns a termékhez: ${product.name}`);
        }
        const variantIndex = (product as any).variants.findIndex(
          (variant: any) => variant.id === item.variantId
        );
        if (variantIndex < 0) {
          throw new Error(`Érvénytelen variáns: ${product.name}`);
        }

        const variant = (product as any).variants[variantIndex];
        if (variant.isActive === false) {
          throw new Error(`A kiválasztott variáns már nem elérhető: ${product.name}`);
        }
        if ((variant.stock || 0) < item.quantity) {
          throw new Error(`Nincs elég készlet a kiválasztott variánshoz: ${product.name}`);
        }

        (product as any).variants[variantIndex].stock = (variant.stock || 0) - item.quantity;
      } else if (requireVariantSelection) {
        if (!item.variantId) {
          throw new Error(`Válassz variánst a termékhez: ${product.name}`);
        }
      } else {
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
        product.stock -= item.quantity;
      }
      if (hasVariants) {
        (product as any).stock = (product as any).variants.reduce(
          (sum: number, current: any) => sum + (current.stock || 0),
          0
        );
      }
      await product.save();
    }
  }

  private static async clearUserCart(userId?: string) {
    if (userId) {
      await Cart.findOneAndUpdate(
        { user: new mongoose.Types.ObjectId(userId) },
        { items: [] }
      );
    }
  }

  private static async sendOrderConfirmation(order: any, orderData: any) {
    try {
      const populatedOrder = await Order.findById(order._id).populate("user");
      const customerEmail = populatedOrder.user?.email || orderData.billingInfo?.email;
      const customerName = populatedOrder.user?.name || orderData.shippingAddress?.name;

      if (customerEmail) {
        await MailerService.sendEmail({
          to: customerEmail,
          templateType: "order_confirmation",
          data: {
            orderNumber: order._id.toString().slice(-6).toUpperCase(),
            customerName,
            totalAmount: order.total.toLocaleString("hu-HU"),
            shippingAddress: `${order.shippingAddress.zip} ${order.shippingAddress.city}, ${order.shippingAddress.street}`,
            items: order.items
              .map((i: any) => `${i.name}${i.variantLabel ? ` [${i.variantLabel}]` : ""} (${i.quantity}x)`)
              .join(", ")
          }
        });
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }
  }

  private static async tryIssueInvoice(_order: any) {
    // Placeholder hook for future invoice providers (e.g. Szamlazz.hu).
    // Keeping this in one place avoids coupling route handlers to invoicing.
    try {
      const invoicingEnabled = await FeatureFlagService.isEnabled("szamlazzInvoicing", false);
      if (!invoicingEnabled) return;
    } catch (error) {
      console.error("Invoice hook check failed:", error);
    }
  }
}
