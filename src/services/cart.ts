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

  static async syncCart(userId: string, localItems: any[]) {
    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let cart = await Cart.findOne({ user: userObjectId });

    if (!cart) {
      cart = new Cart({ user: userObjectId, items: [] });
    }

    // Merge logic: For each local item, add or update in DB
    for (const localItem of localItems) {
      const productObjectId = new mongoose.Types.ObjectId(localItem.id);
      
      // Validate product exists and is active/visible
      const product = await Product.findById(productObjectId);
      if (!product || !product.isActive || !product.isVisible) continue;

      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === localItem.id
      );

      if (existingItemIndex > -1) {
        // If it exists, we take the larger quantity, but capped at stock
        const newQty = Math.max(cart.items[existingItemIndex].quantity, localItem.quantity);
        cart.items[existingItemIndex].quantity = Math.min(newQty, product.stock);
      } else {
        // Capped at stock
        cart.items.push({
          product: productObjectId,
          quantity: Math.min(localItem.quantity, product.stock)
        });
      }
    }

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
