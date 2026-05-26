import dbConnect from "@/lib/db";
import Cart, { ICart } from "@/models/Cart";
import Product from "@/models/Product";
import mongoose from "mongoose";

type LocalCartInput = {
  id?: unknown;
  productId?: unknown;
  quantity?: unknown;
};

function normalizedCartSignature(items: Array<{ product: unknown; quantity: number }>) {
  return JSON.stringify(
    items
      .map((item) => ({
        productId: item.product?.toString() ?? "",
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId))
  );
}

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
  static async replaceCart(userId: string, localItems: LocalCartInput[]) {
    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let cart = await Cart.findOne({ user: userObjectId });

    if (!cart) {
      cart = new Cart({ user: userObjectId, items: [] });
    }

    const requestedByProductId = new Map<string, number>();

    for (const localItem of Array.isArray(localItems) ? localItems : []) {
      const productId = String(localItem.productId || localItem.id || "");
      try {
        const objectId = new mongoose.Types.ObjectId(productId);
        const qty = Math.max(1, Number(localItem.quantity) || 1);
        requestedByProductId.set(objectId.toString(), (requestedByProductId.get(objectId.toString()) || 0) + qty);
      } catch {
        continue;
      }
    }

    const objectIds = [...requestedByProductId.keys()].map((id) => new mongoose.Types.ObjectId(id));
    const products = objectIds.length
      ? await Product.find({
          _id: { $in: objectIds },
          isActive: true,
          isVisible: true,
          deletedAt: null,
        })
          .select("stock")
          .lean()
      : [];

    const nextItems: ICart["items"] = [];
    for (const product of products) {
      const productId = product._id.toString();
      const qty = requestedByProductId.get(productId);
      if (!qty) continue;
      nextItems.push({
        product: product._id,
        quantity: Math.min(qty, product.stock),
      });
    }

    if (normalizedCartSignature(cart.items) === normalizedCartSignature(nextItems)) {
      return await cart.populate("items.product");
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
