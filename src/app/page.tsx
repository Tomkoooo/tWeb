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

export default async function LandingPage() {
  const content = await ShopContentService.getAll()

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
        <Shop />
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
