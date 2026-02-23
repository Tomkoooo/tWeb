import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import mongoose from "mongoose";

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

    return order;
  }

}
