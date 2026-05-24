import dbConnect from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import "@/models/Category";
import { revalidatePath } from "next/cache";
import { revalidateStorefrontSitemap } from "@/lib/sitemap/revalidate-storefront-sitemap";
import { MediaService } from "./media";
import Review from "@/models/Review"; // Ensure Review is registered

export interface ProductFilters {
  search?: string;
  isActive?: boolean;
  isVisible?: boolean;
  isDiscounted?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export class ProductService {
  static async getPaginated(page: number = 1, limit: number = 10, filters: ProductFilters = {}) {
    await dbConnect();
    
    const query: any = {};
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { "variantOptions.values": { $regex: filters.search, $options: "i" } },
        { "variants.nameOverride": { $regex: filters.search, $options: "i" } },
        { "variants.descriptionOverride": { $regex: filters.search, $options: "i" } },
        { "variants.sku": { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isVisible !== undefined) query.isVisible = filters.isVisible;
    
    if (filters.category) {
      const { CategoryService } = await import("./category");
      const categoryIds = await CategoryService.getDescendantIds(filters.category);
      query.category = { $in: categoryIds };
    }
    const allProducts = await Product.find(query).populate("category").lean();
    const normalizedProducts = allProducts.map((product: any) => {
      const variants = Array.isArray(product.variants)
        ? product.variants.filter((variant: any) => variant.isActive !== false)
        : [];
      const hasActiveVariants = variants.length > 0;
      const needsVariantSelection = Boolean(product.requireVariantSelection) && hasActiveVariants;
      const minVariantNetPrice = needsVariantSelection
        ? Math.min(...variants.map((variant: any) => Number(variant.netPrice || product.netPrice) || product.netPrice))
        : product.netPrice;
      const maxVariantDiscount = needsVariantSelection
        ? Math.max(...variants.map((variant: any) => Number(variant.discount || 0) || 0))
        : Number(product.discount || 0) || 0;
      const totalVariantStock = needsVariantSelection
        ? variants.reduce((sum: number, variant: any) => sum + (Number(variant.stock) || 0), 0)
        : Number(product.stock || 0) || 0;
      return {
        ...product,
        __displayNetPrice: minVariantNetPrice,
        __displayDiscount: maxVariantDiscount,
        __displayStock: totalVariantStock,
      };
    });

    const filteredProducts = normalizedProducts.filter((product: any) => {
      if (filters.isDiscounted && product.__displayDiscount <= 0) return false;
      if (filters.minPrice !== undefined && product.__displayNetPrice < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && product.__displayNetPrice > filters.maxPrice) return false;
      return true;
    });

    filteredProducts.sort((a: any, b: any) => {
      const sort = filters.sort || "newest";
      switch (sort) {
        case "price-asc":
          return a.__displayNetPrice - b.__displayNetPrice;
        case "price-desc":
          return b.__displayNetPrice - a.__displayNetPrice;
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "discount":
          return b.__displayDiscount - a.__displayDiscount;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const total = filteredProducts.length;
    const skip = (page - 1) * limit;
    const products = filteredProducts.slice(skip, skip + limit);

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

  static async getBySlug(slug: string) {
    await dbConnect();
    const product = await Product.findOne({ slug, $or: [{ isActive: true }, { isVisible: true }] })
      .populate("category")
      .lean();
    
    if (!product) return null;

    // Fetch reviews separately
    const reviews = await Review.find({
      product: product._id,
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    return {
      ...product,
      reviews
    };
  }

  static async create(data: Partial<IProduct>) {
    await dbConnect();
    const product = await Product.create(data);
    
    // Increment sentiment usage
    if (product.images && product.images.length > 0) {
      await MediaService.incrementUsage(product.images);
    }

    revalidatePath("/admin/products");
    revalidateStorefrontSitemap();
    return product;
  }

  static async update(id: string, data: Partial<IProduct>) {
    await dbConnect();
    const oldProduct = await Product.findById(id).lean();
    const product = await Product.findByIdAndUpdate(id, data, { returnDocument: "after" });
    
    if (oldProduct && product) {
      await MediaService.syncUsage(oldProduct.images || [], product.images || []);
    }

    revalidatePath("/admin/products");
    revalidateStorefrontSitemap();
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
    revalidateStorefrontSitemap();
    return product;
  }
}
