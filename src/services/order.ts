import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import mongoose from "mongoose";
import { MailerService } from "./mailer";
import { FeatureFlagService } from "./feature-flags";
import { InvoicingSzamlazzService } from "./invoicing-szamlazz";
import { formatOrderNumber } from "@/lib/order-number";
import {
  decrementCheckoutLineStock,
  InventoryReservationError,
  restoreCheckoutLineStock,
} from "@/services/inventory-reservation";

export class OrderService {
  static async createOrder(orderData: any, userId?: string) {
    return this.createOrderFromCheckoutData(orderData, userId, { enforceShopEnabled: true });
  }

  static async createOrderFromCheckoutData(
    orderData: any,
    userId?: string,
    options?: { enforceShopEnabled?: boolean; skipStockDecrement?: boolean }
  ) {
    if (options?.enforceShopEnabled !== false) {
      const isShopEnabled = await FeatureFlagService.isEnabled("shopPage", true);
      if (!isShopEnabled) {
        throw new Error("Jelenleg a rendelés leadás szünetel");
      }
    }
    await dbConnect();

    if (options?.skipStockDecrement) {
      await this.validateReservedStockStillCoversOrder(orderData);
    } else {
      await this.validateAndUpdateStockTransactional(orderData);
    }

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

  /** After Stripe inventory hold: DB stock already lowered; verify lines still fit remaining stock. */
  private static async validateReservedStockStillCoversOrder(orderData: any) {
    for (const item of orderData.items) {
      const product = await Product.findById(item.product).lean();
      if (!product) throw new Error(`Product ${item.product} not found`);
      if (!product.isActive || !product.isVisible) throw new Error(`${product.name} is no longer available`);
      const hasVariants = Array.isArray((product as any).variants) && (product as any).variants.length > 0;
      const requireVariantSelection = Boolean((product as any).requireVariantSelection) && hasVariants;

      if (item.variantId) {
        if (!hasVariants) throw new Error(`Érvénytelen variáns a termékhez: ${product.name}`);
        const variant = (product as any).variants.find((v: any) => v.id === item.variantId);
        if (!variant) throw new Error(`Érvénytelen variáns: ${product.name}`);
        if (variant.isActive === false) {
          throw new Error(`A kiválasztott variáns már nem elérhető: ${product.name}`);
        }
        if ((variant.stock || 0) < item.quantity) {
          throw new Error(`Nincs elég készlet a kiválasztott variánshoz: ${product.name}`);
        }
      } else if (requireVariantSelection) {
        if (!item.variantId) throw new Error(`Válassz variánst a termékhez: ${product.name}`);
      } else {
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      }
    }
  }

  /** Per-line atomic decrement for non-Stripe checkout (no reservation rows; standalone-Mongo safe). */
  private static async validateAndUpdateStockTransactional(orderData: any) {
    const applied: { product: string; variantId?: string; quantity: number }[] = [];
    try {
      for (const item of orderData.items) {
        const line = {
          product: String(item.product),
          variantId: item.variantId,
          quantity: item.quantity,
        };
        await decrementCheckoutLineStock(undefined, line);
        applied.push(line);
      }
    } catch (e: any) {
      for (const line of applied.reverse()) {
        try {
          await restoreCheckoutLineStock(line);
        } catch {
          /* best-effort rollback */
        }
      }
      if (e instanceof InventoryReservationError) throw new Error(e.message);
      throw e instanceof Error ? e : new Error(String(e));
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
            orderNumber: formatOrderNumber(order._id),
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
    const order = _order as any;
    try {
      const invoicingEnabled = await FeatureFlagService.isEnabled("szamlazzInvoicing", false);
      if (!invoicingEnabled) return;

      order.invoiceMode = "automatic";
      order.invoiceStatus = "pending";
      await order.save();

      const result = await InvoicingSzamlazzService.issueInvoice(order);
      order.invoiceId = result.invoiceId;
      order.invoiceStatus = "issued";
      order.invoiceIssuedAt = new Date();
      order.invoiceLastError = undefined;
      if (result.pdfFileName) {
        order.invoicePdfFileName = result.pdfFileName;
      }
      await order.save();

      await this.sendInvoiceEmail(order, "invoice_sent", "A számla csatolmányban elérhető.");
    } catch (error: any) {
      order.invoiceStatus = "failed";
      order.invoiceLastError = error?.message || "Ismeretlen számlázási hiba";
      await order.save();
      await this.sendInvoiceEmail(order, "invoice_issue", "A számla automatikus kiállítása nem sikerült.");
      console.error("Invoice hook check failed:", error);
    }
  }

  static async sendInvoiceEmail(orderInput: any, templateType: "invoice_sent" | "invoice_issue", message: string) {
    try {
      const order = await Order.findById(orderInput._id).populate("user");
      if (!order) return;
      const orderIdRaw = order._id || orderInput._id;
      if (!orderIdRaw) return;
      const orderId = String(orderIdRaw);

      const customerEmail = (order as any).user?.email || order.billingInfo?.email;
      const customerName = (order as any).user?.name || order.shippingAddress?.name;
      if (!customerEmail) return;

      let attachments: { filename: string; content: Buffer; contentType?: string }[] | undefined;
      if (templateType === "invoice_sent") {
        const invoicePdf = await InvoicingSzamlazzService.downloadInvoicePdf({
          invoiceId: order.invoiceId,
          orderNumber: orderId,
          fallbackFileName: order.invoicePdfFileName,
        });
        if (invoicePdf) {
          attachments = [
            {
              filename: `${order.invoiceId || `invoice-${formatOrderNumber(orderId)}`}.pdf`,
              content: invoicePdf,
              contentType: "application/pdf",
            },
          ];
        }
      }

      await MailerService.sendEmail({
        to: customerEmail,
        templateType,
        data: {
          customerName,
          orderNumber: formatOrderNumber(orderId),
          invoiceId: order.invoiceId || "",
          invoiceMessage: message,
        },
        attachments,
      });

      order.invoiceEmailSentAt = new Date();
      if (typeof (order as any).save === "function") {
        await order.save();
      }
    } catch (error) {
      console.error("Failed to send invoice email:", error);
    }
  }
}
