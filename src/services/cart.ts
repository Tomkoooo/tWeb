import dbConnect from "@/lib/db";
import Cart, { ICart } from "@/models/Cart";
import Product from "@/models/Product";
import mongoose from "mongoose";

export class CartService {
  static async getCart(userId: string) {
    await dbConnect();
    let cart = await Cart.findOne({ user: new mongoose.Types.ObjectId(userId) })
      .populate("items.product")
      .lean();
    
    if (!cart) {
      cart = await Cart.create({ 
        user: new mongoose.Types.ObjectId(userId), 
        items: [] 
      });
    }
    
    return cart;
  }

  /** Replace server cart with validated client lines (one row per product). */
  static async replaceCart(userId: string, localItems: any[]) {
    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let cart = await Cart.findOne({ user: userObjectId });

    if (!cart) {
      cart = new Cart({ user: userObjectId, items: [] });
    }

    const nextItems: ICart["items"] = [];

    for (const localItem of localItems) {
      const productId = String(localItem.productId || localItem.id);
      let productObjectId: mongoose.Types.ObjectId;
      try {
        productObjectId = new mongoose.Types.ObjectId(productId);
      } catch {
        continue;
      }

      const product = await Product.findById(productObjectId);
      if (!product || !product.isActive || !product.isVisible) continue;

      const qty = Math.max(1, Number(localItem.quantity) || 1);
      nextItems.push({
        product: productObjectId,
        quantity: Math.min(qty, product.stock),
      });
    }

    cart.items = nextItems;
    await cart.save();
    return await cart.populate("items.product");
  }

  static async updateQuantity(userId: string, productId: string, quantity: number) {
    await dbConnect();
    const cart = await Cart.findOne({ user: new mongoose.Types.ObjectId(userId) });
    if (!cart) throw new Error("Cart not found");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = Math.min(quantity, product.stock);
      }
      await cart.save();
    }
    
    return await cart.populate("items.product");
  }

  static async removeItem(userId: string, productId: string) {
    await dbConnect();
    const cart = await Cart.findOne({ user: new mongoose.Types.ObjectId(userId) });
    if (!cart) return null;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    
    await cart.save();
    return await cart.populate("items.product");
  }
}
