import dbConnect from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import "@/models/Category";
import { revalidatePath } from "next/cache";
import { revalidateStorefrontSitemap } from "@/lib/sitemap/revalidate-storefront-sitemap";
import { revalidateStorefrontTags, STOREFRONT_CACHE_TAGS } from "@/lib/storefront-cache-tags";
import { MediaService } from "./media";
import Review from "@/models/Review";
import mongoose from "mongoose";

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

function normalizeProductForListing(product: Record<string, unknown> | object) {
  const row = product as Record<string, unknown>
  const variants = Array.isArray(row.variants)
    ? (row.variants as Array<Record<string, unknown>>).filter((v) => v.isActive !== false)
    : [];
  const hasActiveVariants = variants.length > 0;
  const needsVariantSelection =
    Boolean(row.requireVariantSelection) && hasActiveVariants;
  const netPrice = Number(row.netPrice) || 0;
  const minVariantNetPrice = needsVariantSelection
    ? Math.min(
        ...variants.map((v) => Number(v.netPrice ?? netPrice) || netPrice)
      )
    : netPrice;
  const maxVariantDiscount = needsVariantSelection
    ? Math.max(...variants.map((v) => Number(v.discount || 0) || 0))
    : Number(row.discount || 0) || 0;
  const totalVariantStock = needsVariantSelection
    ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : Number(row.stock || 0) || 0;
  return {
    ...row,
    __displayNetPrice: minVariantNetPrice,
    __displayDiscount: maxVariantDiscount,
    __displayStock: totalVariantStock,
  } as Record<string, unknown> & {
    __displayNetPrice: number
    __displayDiscount: number
    __displayStock: number
    createdAt?: string | Date
  }
}

function sortFieldForFilter(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "price-asc":
    case "price-desc":
    case "discount":
      return { createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

export class ProductService {
  static async getPaginated(page: number = 1, limit: number = 10, filters: ProductFilters = {}) {
    await dbConnect();

    const query: Record<string, unknown> = {};

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

    const needsInMemoryFilter =
      filters.isDiscounted ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.sort === "price-asc" ||
      filters.sort === "price-desc" ||
      filters.sort === "discount";

    if (!needsInMemoryFilter) {
      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        Product.find(query)
          .populate("category")
          .sort(sortFieldForFilter(filters.sort))
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ]);
      return {
        products: products.map((p) => normalizeProductForListing(p)),
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }

    const allProducts = await Product.find(query).populate("category").lean();
    const normalizedProducts = allProducts.map((product) => normalizeProductForListing(product));

    const filteredProducts = normalizedProducts.filter((product) => {
      if (filters.isDiscounted && product.__displayDiscount <= 0) return false;
      if (filters.minPrice !== undefined && product.__displayNetPrice < filters.minPrice)
        return false;
      if (filters.maxPrice !== undefined && product.__displayNetPrice > filters.maxPrice)
        return false;
      return true;
    });

    filteredProducts.sort((a, b) => {
      const sort = filters.sort || "newest";
      switch (sort) {
        case "price-asc":
          return a.__displayNetPrice - b.__displayNetPrice;
        case "price-desc":
          return b.__displayNetPrice - a.__displayNetPrice;
        case "oldest":
          return new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime();
        case "discount":
          return b.__displayDiscount - a.__displayDiscount;
        case "newest":
        default:
          return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
      }
    });

    const total = filteredProducts.length;
    const skip = (page - 1) * limit;
    const products = filteredProducts.slice(skip, skip + limit);

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async getByIds(ids: string[]) {
    await dbConnect();
    const objectIds = ids.filter((id) => mongoose.isValidObjectId(id));
    if (objectIds.length === 0) return [];
    const rows = await Product.find({ _id: { $in: objectIds } })
      .populate("category")
      .lean();
    return rows;
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

    const reviews = await Review.find({
      product: product._id,
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    return {
      ...product,
      reviews,
    };
  }

  static async create(data: Partial<IProduct>) {
    await dbConnect();
    const product = await Product.create(data);

    if (product.images && product.images.length > 0) {
      await MediaService.incrementUsage(product.images);
    }

    revalidatePath("/admin/products");
    revalidateStorefrontSitemap();
    revalidateStorefrontTags(STOREFRONT_CACHE_TAGS.products);
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
    revalidateStorefrontTags(STOREFRONT_CACHE_TAGS.products);
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
    revalidateStorefrontTags(STOREFRONT_CACHE_TAGS.products);
    return product;
  }
}
