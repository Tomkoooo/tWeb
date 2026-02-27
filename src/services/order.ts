import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import mongoose from "mongoose";
import { MailerService } from "./mailer";
import User from "@/models/User";

export class OrderService {
  static async createOrder(orderData: any, userId?: string) {
    await dbConnect();

    // 1. Validate items and update stock
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);
      if (!product.isActive || !product.isVisible) throw new Error(`${product.name} is no longer available`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      product.stock -= item.quantity;
      await product.save();
    }

    // 2. Create the order
    const order = new Order({
      ...orderData,
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    });
    await order.save();

    // 3. Clear the cart if user is logged in
    if (userId) {
      await Cart.findOneAndUpdate(
        { user: new mongoose.Types.ObjectId(userId) },
        { items: [] }
      );
    }


    // 4. Trigger Order Confirmation Email
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
            items: order.items.map((i: any) => `${i.name} (${i.quantity}x)`).join(", ")
          }
        });
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }

    return order;
  }

}
