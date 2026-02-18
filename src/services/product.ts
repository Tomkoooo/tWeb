import dbConnect from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import { revalidatePath } from "next/cache";
import { MediaService } from "./media";

export interface ProductFilters {
  search?: string;
  isActive?: boolean;
  isVisible?: boolean;
  isDiscounted?: boolean;
  category?: string;
}

export class ProductService {
  static async getPaginated(page: number = 1, limit: number = 10, filters: ProductFilters = {}) {
    await dbConnect();
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } }
      ];
    }

    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isVisible !== undefined) query.isVisible = filters.isVisible;
    if (filters.isDiscounted) query.discount = { $gt: 0 };
    if (filters.category) query.category = filters.category;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  }


  static async getById(id: string) {
    await dbConnect();
    return await Product.findById(id).populate("category").lean();
  }

  static async create(data: Partial<IProduct>) {
    await dbConnect();
    const product = await Product.create(data);
    
    // Increment sentiment usage
    if (product.images && product.images.length > 0) {
      await MediaService.incrementUsage(product.images);
    }

    revalidatePath("/admin/products");
    return product;
  }

  static async update(id: string, data: Partial<IProduct>) {
    await dbConnect();
    const oldProduct = await Product.findById(id).lean();
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    
    if (oldProduct && product) {
      await MediaService.syncUsage(oldProduct.images || [], product.images || []);
    }

    revalidatePath("/admin/products");
    return product;
  }

  static async delete(id: string) {
    await dbConnect();
    const product = await Product.findById(id);
    if (product) {
      if (product.images && product.images.length > 0) {
        await MediaService.decrementUsage(product.images);
      }
      await Product.findByIdAndDelete(id);
    }
    revalidatePath("/admin/products");
    return product;
  }
}
