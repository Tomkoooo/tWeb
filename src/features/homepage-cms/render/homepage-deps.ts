import { CategoryService } from "@/services/category"
import { ProductService } from "@/services/product"
import { FeedbackService } from "@/services/feedback"
import { FeatureFlagService } from "@/services/feature-flags"
import { ShopContentService } from "@/services/shop-content"

type ProductRating = { rating?: number }
type ProductVariant = { isActive?: boolean; netPrice?: number; discount?: number }
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
}

export async function getHomepageRenderDependencies() {
  const [reviews, isShopPageEnabled, content] = await Promise.all([
    FeedbackService.getHomepageReviews(6),
    FeatureFlagService.isEnabled("shopPage", true),
    ShopContentService.getAll(),
  ])

  let products: Array<{
    id: string
    name: string
    slug: string
    price: number
    image: string
    category: string
    rating: number
    hasVariants: boolean
    requireVariantSelection: boolean
  }> = []

  let categories: Array<{ id: string; name: string; description: string; image: string; slug: string }> = []

  if (isShopPageEnabled) {
    const [categoryData, productData] = await Promise.all([
      CategoryService.getAll(),
      ProductService.getPaginated(1, 24, { isVisible: true }),
    ])

    products = (productData.products as ProductItem[]).map((p) => ({
      hasVariants: Array.isArray(p.variants) && p.variants.length > 0,
      rating:
        Array.isArray(p.ratings) && p.ratings.length > 0
          ? p.ratings.reduce((sum: number, rating) => sum + (rating.rating || 0), 0) / p.ratings.length
          : 0,
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      requireVariantSelection: Boolean(p.requireVariantSelection),
      price: (() => {
        const variants = Array.isArray(p.variants) ? p.variants.filter((v) => v.isActive !== false) : []
        const needsVariant = Boolean(p.requireVariantSelection) && variants.length > 0
        const minNet = needsVariant
          ? Math.min(...variants.map((v) => Number(v.netPrice || p.netPrice) || p.netPrice))
          : p.netPrice
        const maxDiscount = needsVariant
          ? Math.max(...variants.map((v) => Number(v.discount || 0) || 0))
          : Number(p.discount || 0) || 0
        const gross = minNet * 1.27
        return gross * (1 - maxDiscount / 100)
      })(),
      image: p.images?.[0] ? `/api/media/${p.images[0]}` : "/placeholder-product.jpg",
      category: p.category?.name || "Kategória",
    }))

    categories = (categoryData.slice(0, 4) as CategoryItem[]).map((c) => ({
      id: c._id.toString(),
      name: c.name,
      description: c.seo?.description || "Minőségi válogatás",
      image: c.image ? `/api/media/${c.image}` : "/placeholder-cat.jpg",
      slug: c.slug,
    }))
  }

  return {
    products,
    categories,
    reviews,
    company: {
      name: content.brand_name || "Company name",
      address: content.contact_address || "Company address",
      phone: content.contact_phone || "+36...",
      email: content.contact_email || "hello@example.com",
    },
  }
}
