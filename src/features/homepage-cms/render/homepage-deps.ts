import { CategoryService } from "@/services/category"
import { ProductService } from "@/services/product"
import { FeedbackService } from "@/services/feedback"
import { FeatureFlagService } from "@/services/feature-flags"
import { ShopContentService } from "@/services/shop-content"
import { mediaImageSrc } from "@/lib/images"
import { grossFromNetWithDiscount, clampVatPercent } from "@/lib/pricing"
import {
  orderIdsByList,
  resolveFeaturedCategoryIds,
  resolveFeaturedProductIds,
} from "@/lib/featured-products"
import type { HomePageDeps, HomePageFeaturedProduct } from "@/templates/types"

type ProductRating = { rating?: number }
type ProductVariant = {
  id: string
  attributes?: Record<string, string>
  netPrice?: number
  discount?: number
  stock?: number
  isActive?: boolean
  isDefault?: boolean
  images?: string[]
}
type ProductCategory = { name?: string }
type CategoryItem = {
  _id: { toString(): string }
  name: string
  seo?: { description?: string }
  image?: string
  slug: string
}
type ProductItem = {
  _id: { toString(): string }
  name: string
  slug: string
  variants?: ProductVariant[]
  ratings?: ProductRating[]
  requireVariantSelection?: boolean
  netPrice: number
  discount?: number
  images?: string[]
  category?: ProductCategory
  stock?: number
  vatPercent?: number
}

export type HomepageRenderDependencies = Omit<HomePageDeps, "templateId">

function mapFeaturedProduct(p: ProductItem): HomePageFeaturedProduct {
  const allVariants = Array.isArray(p.variants) ? p.variants : []
  const effectiveVariants = allVariants.filter((v) => v.isActive !== false)
  const hasVariants = allVariants.length > 0
  const needsVariantPricing =
    Boolean(p.requireVariantSelection) &&
    effectiveVariants.length > 0

  const minNet = needsVariantPricing
    ? Math.min(
        ...effectiveVariants.map((v) => Number(v.netPrice ?? p.netPrice) || p.netPrice)
      )
    : p.netPrice
  const maxDiscount = needsVariantPricing
    ? Math.max(...effectiveVariants.map((v) => Number(v.discount || 0) || 0))
    : Number(p.discount || 0) || 0

  const gross = grossFromNetWithDiscount(minNet, maxDiscount, clampVatPercent(p.vatPercent))
  const rootStock =
    typeof p.stock === "number" && Number.isFinite(p.stock) ? p.stock : 100

  return {
    hasVariants,
    rating:
      Array.isArray(p.ratings) && p.ratings.length > 0
        ? p.ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0) / p.ratings.length
        : 0,
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    requireVariantSelection: Boolean(p.requireVariantSelection),
    price: gross,
    image: mediaImageSrc(p.images?.[0]),
    category: p.category?.name || "Kategória",
    netPrice: p.netPrice,
    discount: Number(p.discount || 0) || 0,
    images: (p.images || []).map((img) => mediaImageSrc(img)),
    stock: rootStock,
    variants: allVariants.map((v) => ({
      id: v.id,
      netPrice: v.netPrice ?? p.netPrice,
      discount: v.discount,
      stock: v.stock,
      isActive: v.isActive,
      isDefault: v.isDefault,
      attributes: v.attributes,
      images: v.images?.map((img) => mediaImageSrc(img)),
    })),
  }
}

export type HomepageFeaturedResolveOptions = {
  cmsSelectedProductIds?: string[]
  maxItems?: number
}

export async function getHomepageRenderDependencies(
  options: HomepageFeaturedResolveOptions = {}
): Promise<HomepageRenderDependencies> {
  const [reviews, isShopPageEnabled, content] = await Promise.all([
    FeedbackService.getHomepageReviews(6),
    FeatureFlagService.isEnabled("shopPage", true),
    ShopContentService.getAll(),
  ])

  let products: HomePageFeaturedProduct[] = []
  let categories: Array<{ id: string; name: string; description: string; image: string; slug: string }> = []

  if (isShopPageEnabled) {
    const [categoryData, featuredIds] = await Promise.all([
      CategoryService.getAll(),
      resolveFeaturedProductIds({
        cmsSelectedProductIds: options.cmsSelectedProductIds,
        maxItems: options.maxItems,
      }),
    ])

    const categoryById = new Map(
      (categoryData as CategoryItem[]).map((c) => [c._id.toString(), c])
    )
    const featuredCategoryIds = await resolveFeaturedCategoryIds(4)
    categories = featuredCategoryIds
      .map((id) => categoryById.get(id))
      .filter((c): c is CategoryItem => Boolean(c))
      .map((c) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.seo?.description || "Minőségi válogatás",
        image: mediaImageSrc(c.image),
        slug: c.slug,
      }))

    const productRows = await Promise.all(
      featuredIds.map((id) => ProductService.getById(id))
    )
    const ordered = orderIdsByList(
      featuredIds,
      productRows.filter(Boolean) as ProductItem[]
    )
    products = ordered.map(mapFeaturedProduct)
  }

  return {
    products,
    categories,
    reviews,
    company: {
      name: content.brand_name || "Company name",
      address: content.contact_address || "",
      phone: content.contact_phone || "",
      email: content.contact_email || "",
    },
  }
}
