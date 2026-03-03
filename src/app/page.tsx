import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { Story } from "@/components/sections/Story"
import { Shop } from "@/components/sections/Shop"
import { Reviews } from "@/components/sections/Reviews"
import { Features } from "@/components/sections/Features"
import { Contact } from "@/components/sections/Contact"

export const metadata = {
  title: "Krausz Barkácsmester | Professzionális Barkács Szerszámok",
  description: "Mestermunka a kezedben. Kiváló minőségű kalapácsok, csavarkulcsok és elektromos szerszámok a modern mesterembernek.",
}

import { ShopContentService } from "@/services/shop-content"
import { CategoryService } from "@/services/category"
import { ProductService } from "@/services/product"
import { FeedbackService } from "@/services/feedback"
import { FeatureFlagService } from "@/services/feature-flags"

export default async function LandingPage() {
  const [content, reviews, isShopPageEnabled] = await Promise.all([
    ShopContentService.getAll(),
    FeedbackService.getHomepageReviews(6),
    FeatureFlagService.isEnabled("shopPage", true),
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

  let shopCategories: Array<{
    id: string
    name: string
    description: string
    image: string
    slug: string
  }> = []

  if (isShopPageEnabled) {
    const [categories, productData] = await Promise.all([
      CategoryService.getAll(),
      ProductService.getPaginated(1, 8, { isVisible: true }),
    ])

    // Process data for the Shop component
    products = productData.products.map(p => ({
      hasVariants: Array.isArray((p as any).variants) && (p as any).variants.length > 0,
      // Fallback to 0 when there is no review data.
      // This avoids showing an inflated default rating in listings.
      rating: Array.isArray((p as any).ratings) && (p as any).ratings.length > 0
        ? (p as any).ratings.reduce((sum: number, rating: any) => sum + (rating.rating || 0), 0) / (p as any).ratings.length
        : 0,
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      requireVariantSelection: Boolean((p as any).requireVariantSelection),
      price: (() => {
        const variants = Array.isArray((p as any).variants) ? (p as any).variants.filter((v: any) => v.isActive !== false) : []
        const needsVariant = Boolean((p as any).requireVariantSelection) && variants.length > 0
        const minNet = needsVariant
          ? Math.min(...variants.map((v: any) => Number(v.netPrice || p.netPrice) || p.netPrice))
          : p.netPrice
        const maxDiscount = needsVariant
          ? Math.max(...variants.map((v: any) => Number(v.discount || 0) || 0))
          : Number(p.discount || 0) || 0
        const gross = minNet * 1.27
        return gross * (1 - maxDiscount / 100)
      })(),
      image: p.images?.[0] ? `/api/media/${p.images[0]}` : "/placeholder-product.jpg",
      category: (p.category as any)?.name || "Kategória",
    }))

    shopCategories = categories.slice(0, 4).map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.seo?.description || "Minőségi válogatás",
      image: c.image ? `/api/media/${c.image}` : "/placeholder-cat.jpg",
      slug: c.slug
    }))
  }
  return (
    <div className="flex flex-col min-h-screen bg-background-dark selection:bg-accent selection:text-white overflow-x-hidden">
      <Navbar />
      
      <main className="overflow-x-hidden">
        <Hero 
          title={content.hero_title} 
          description={content.hero_description} 
        />
        <Story 
          title={content.story_title} 
          content={content.story_content} 
          accordions={content.story_accordions}
        />
        {isShopPageEnabled ? <Shop categories={shopCategories} products={products} /> : null}
        <Features />
        <Reviews reviews={reviews} />
        <Contact 
          email={content.contact_email}
          phone={content.contact_phone}
          address={content.contact_address}
        />
      </main>

      <Footer />
    </div>
  )
}
