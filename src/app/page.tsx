import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { Story } from "@/components/sections/Story"
import { Shop } from "@/components/sections/Shop"
import { Reviews } from "@/components/sections/Reviews"
import { Features } from "@/components/sections/Features"
import { Contact } from "@/components/sections/Contact"

export const metadata = {
  title: "Krausz Barkács Mester | Professzionális Barkács Szerszámok",
  description: "Mestermunka a kezedben. Kiváló minőségű kalapácsok, csavarkulcsok és elektromos szerszámok a modern mesterembernek.",
}

import { ShopContentService } from "@/services/shop-content"
import { CategoryService } from "@/services/category"
import { ProductService } from "@/services/product"

export default async function LandingPage() {
  const [content, categories, productData] = await Promise.all([
    ShopContentService.getAll(),
    CategoryService.getAll(),
    ProductService.getPaginated(1, 8, { isVisible: true })
  ])

  // Process data for the Shop component
  const products = productData.products.map(p => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    price: (p.netPrice * 1.27) - (p.discount || 0),
    image: p.images?.[0] ? `/api/media/${p.images[0]}` : "/placeholder-product.jpg",
    category: (p.category as any)?.name || "Kategória",
    rating: 5 // Default for now
  }));

  const shopCategories = categories.slice(0, 4).map(c => ({
    id: c._id.toString(),
    name: c.name,
    description: c.seo?.description || "Minőségi válogatás",
    image: c.image ? `/api/media/${c.image}` : "/placeholder-cat.jpg",
    slug: c.slug
  }));
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
        />
        <Shop categories={shopCategories} products={products} />
        <Features />
        <Reviews />
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
