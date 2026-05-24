import { resolveSiteContactChannels } from "@/lib/site-contact"
import { ProductService } from "@/services/product"
import { FeedbackService } from "@/services/feedback"
import {
  getCachedShopContent,
  getCachedCategories,
  getCachedCategoryTree,
  getCachedFeatureFlag,
} from "@/lib/cached-storefront"
import { mediaImageSrc } from "@/lib/images"
import { listingPriceSummary } from "@/lib/pricing"
import {
  orderIdsByList,
  resolveFeaturedCategoryIds,
  resolveFeaturedProductIds,
} from "@/lib/featured-products"
import type { HomePageDeps, HomePageFeaturedProduct } from "@/templates/types"
import type { ShopContentSnapshot } from "@/lib/storefront-footer-data"
import type { CategoryTreeNode } from "@/lib/storefront-footer-data"

type ProductRating = { rating?: number }
type ProductVariant = {
  id: string
  attributes?: Record<string, string>
  netPrice?: number
  grossPrice?: number
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
  grossPrice?: number
  images?: string[]
  category?: ProductCategory
  stock?: number
  vatPercent?: number
}

export type HomepageRenderDependencies = Omit<HomePageDeps, "templateId">

export type HomepageDepsInternal = HomepageRenderDependencies & {
  shopContentSnapshot: ShopContentSnapshot
  categoryTreeSnapshot: CategoryTreeNode[]
}

function mapFeaturedProduct(p: ProductItem): HomePageFeaturedProduct {
  const allVariants = Array.isArray(p.variants) ? p.variants : []
  const effectiveVariants = allVariants.filter((v) => v.isActive !== false)
  const hasVariants = allVariants.length > 0
  const listingLines =
    effectiveVariants.length > 0
      ? effectiveVariants.map((v) => ({
          netPrice: Number(v.netPrice ?? p.netPrice) || p.netPrice,
          discount: Number(v.discount || 0) || 0,
          grossPrice: v.grossPrice,
        }))
      : [
          {
            netPrice: p.netPrice,
            discount: Number(p.discount || 0) || 0,
            grossPrice: p.grossPrice,
          },
        ]
  const { unitGross: gross, maxDiscount } = listingPriceSummary(listingLines, p.vatPercent)
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
    vatPercent: p.vatPercent,
    grossPrice: p.grossPrice,
    images: (p.images || []).map((img) => mediaImageSrc(img)),
    stock: rootStock,
    variants: allVariants.map((v) => ({
      id: v.id,
      netPrice: v.netPrice ?? p.netPrice,
      grossPrice: v.grossPrice,
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
): Promise<HomepageDepsInternal> {
  const [reviews, isShopPageEnabled, content, categoryTree, categoryData] = await Promise.all([
    FeedbackService.getHomepageReviews(6),
    getCachedFeatureFlag("shopPage", true),
    getCachedShopContent(),
    getCachedCategoryTree(),
    getCachedCategories(),
  ])

  let products: HomePageFeaturedProduct[] = []
  let categories: Array<{ id: string; name: string; description: string; image: string; slug: string }> = []

  if (isShopPageEnabled) {
    const featuredIds = await resolveFeaturedProductIds({
      cmsSelectedProductIds: options.cmsSelectedProductIds,
      maxItems: options.maxItems,
    })

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

    const productRows = await ProductService.getByIds(featuredIds)
    const ordered = orderIdsByList(
      featuredIds,
      productRows.filter(Boolean) as ProductItem[]
    )
    products = ordered.map(mapFeaturedProduct)
  }

  const channels = resolveSiteContactChannels(content)

  return {
    products,
    categories,
    reviews,
    siteContact: channels,
    company: {
      name: content.brand_name || "Company name",
      address: channels.address,
      phone: channels.phone,
      email: channels.primaryEmail,
      contactEmails: channels.emails,
    },
    shopContentSnapshot: content,
    categoryTreeSnapshot: categoryTree as CategoryTreeNode[],
  }
}
