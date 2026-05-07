import type { MetadataRoute } from "next";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { SeoSettingsService } from "@/services/seo-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await SeoSettingsService.get();
  const baseUrl =
    settings.canonicalBaseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cart`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/checkout`, changeFrequency: "weekly", priority: 0.5 },
  ];

  await dbConnect();
  const products = await Product.find({
    isActive: true,
    isVisible: true,
  })
    .select("slug updatedAt")
    .lean();

  type SitemapProduct = { slug?: string; updatedAt?: Date | string };
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product: SitemapProduct) => Boolean(product.slug))
    .map((product: SitemapProduct) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticRoutes, ...productRoutes];
}
