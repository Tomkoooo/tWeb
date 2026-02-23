import dbConnect from "@/lib/db";
import Category, { ICategory } from "@/models/Category";
import { revalidatePath } from "next/cache";
import { MediaService } from "./media";

export class CategoryService {
  static async getAll() {
    await dbConnect();
    return await Category.find({}).populate("parent").lean();
  }

  static async getById(id: string) {
    await dbConnect();
    return await Category.findById(id).populate("parent").lean();
  }

  static async create(data: Partial<ICategory>) {
    await dbConnect();
    const category = await Category.create(data);
    
    if (category.image) {
      await MediaService.incrementUsage(category.image);
    }

    revalidatePath("/admin/categories");
    return category;
  }

  static async update(id: string, data: Partial<ICategory>) {
    await dbConnect();
    const oldCategory = await Category.findById(id).lean();
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    
    if (oldCategory && category) {
      await MediaService.syncUsage(
        oldCategory.image ? [oldCategory.image] : [],
        category.image ? [category.image] : []
      );
    }

    revalidatePath("/admin/categories");
    return category;
  }

  static async delete(id: string) {
    await dbConnect();
    const category = await Category.findById(id);
    if (category) {
      if (category.image) {
        await MediaService.decrementUsage(category.image);
      }
      await Category.findByIdAndDelete(id);
    }
    revalidatePath("/admin/categories");
    return category;
  }

  static async getTree() {
    await dbConnect();
    const categories = await Category.find({}).lean();
    
    const buildTree = (parentId: string | null = null): any[] => {
      return categories
        .filter(cat => (cat.parent?.toString() || null) === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat._id.toString())
        }));
    };

    return buildTree(null);
  }

  static async getDescendantIds(parentId: string): Promise<string[]> {
    await dbConnect();
    const categories = await Category.find({}).lean();
    
    const getIds = (id: string): string[] => {
      const children = categories.filter(cat => (cat.parent?.toString() || null) === id);
      let ids = [id];
      for (const child of children) {
        ids = [...ids, ...getIds(child._id.toString())];
      }
      return ids;
    };

    return getIds(parentId);
  }
}
