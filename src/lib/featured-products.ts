import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import {
  ShopFeaturedSettingsService,
  type ShopFeaturedSettings,
} from "@/services/shop-featured-settings";

type WithFeaturedIndex = {
  featuredListIndex?: number | null;
  createdAt?: Date | string;
  _id: { toString(): string };
};

/** Lower index first; unset indexes sort after set ones, then newest. */
export function sortByFeaturedListIndex<T extends WithFeaturedIndex>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = a.featuredListIndex;
    const bi = b.featuredListIndex;
    const aSet = ai != null && Number.isFinite(Number(ai));
    const bSet = bi != null && Number.isFinite(Number(bi));
    if (aSet && bSet) return Number(ai) - Number(bi);
    if (aSet) return -1;
    if (bSet) return 1;
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });
}

export function orderIdsByList<T extends { _id: { toString(): string } }>(
  ids: string[],
  rows: T[]
): T[] {
  const byId = new Map(rows.map((row) => [row._id.toString(), row]));
  const ordered: T[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (row) ordered.push(row);
  }
  return ordered;
}

export type ResolveFeaturedProductsInput = {
  /** CMS productGrid block overrides shop mode when non-empty. */
  cmsSelectedProductIds?: string[];
  maxItems?: number;
};

export async function resolveFeaturedProductIds(
  input: ResolveFeaturedProductsInput = {}
): Promise<string[]> {
  await dbConnect();
  const settings = await ShopFeaturedSettingsService.get();
  const limit = Math.min(
    48,
    Math.max(1, input.maxItems ?? settings.maxItems ?? 24)
  );

  const cmsIds = (input.cmsSelectedProductIds ?? []).filter(Boolean);
  if (cmsIds.length > 0) {
    const visible = await Product.find({
      _id: { $in: cmsIds.filter((id) => mongoose.isValidObjectId(id)) },
      isVisible: true,
    })
      .select("_id")
      .lean();
    const ordered = orderIdsByList(cmsIds, visible);
    return ordered.map((p) => p._id.toString()).slice(0, limit);
  }

  return resolveFromShopSettings(settings, limit);
}

async function resolveFromShopSettings(
  settings: ShopFeaturedSettings,
  limit: number
): Promise<string[]> {
  if (settings.mode === "manual" && settings.manualProductIds.length > 0) {
    const ids = settings.manualProductIds.filter((id) => mongoose.isValidObjectId(id));
    const rows = await Product.find({ _id: { $in: ids }, isVisible: true }).select("_id").lean();
    return orderIdsByList(ids, rows)
      .map((p) => p._id.toString())
      .slice(0, limit);
  }

  if (settings.mode === "byCategory" && settings.orderedCategoryIds.length > 0) {
    const categoryIds = settings.orderedCategoryIds.filter((id) =>
      mongoose.isValidObjectId(id)
    );
    const perCat =
      settings.perCategoryLimit > 0 ? settings.perCategoryLimit : limit;
    const result: string[] = [];

    for (const categoryId of categoryIds) {
      if (result.length >= limit) break;
      const products = await Product.find({
        category: categoryId,
        isVisible: true,
      })
        .select("_id featuredListIndex createdAt")
        .lean();
      const sorted = sortByFeaturedListIndex(products as WithFeaturedIndex[]);
      const take = Math.min(perCat, limit - result.length);
      for (const p of sorted.slice(0, take)) {
        result.push(p._id.toString());
      }
    }
    return result;
  }

  const products = await Product.find({ isVisible: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("_id")
    .lean();
  return products.map((p) => p._id.toString());
}

export async function resolveFeaturedCategoryIds(limit = 4): Promise<string[]> {
  await dbConnect();
  const settings = await ShopFeaturedSettingsService.get();

  if (settings.mode === "byCategory" && settings.orderedCategoryIds.length > 0) {
    return settings.orderedCategoryIds
      .filter((id) => mongoose.isValidObjectId(id))
      .slice(0, limit);
  }

  const categories = await Category.find({}).select("_id featuredListIndex createdAt").lean();
  return sortByFeaturedListIndex(categories as WithFeaturedIndex[])
    .map((c) => c._id.toString())
    .slice(0, limit);
}
