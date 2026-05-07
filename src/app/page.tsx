import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import { RealHomepageSections } from "@/features/homepage-cms/render/RealHomepageSections"
import { HomepageCmsService } from "@/services/homepage-cms"
import { BrandingSettingsService } from "@/services/branding-settings"

import { ShopContentService } from "@/services/shop-content"
import { FooterSettingsService } from "@/services/footer-settings"
import { CategoryService } from "@/services/category"

type FooterCategoryItem = {
  id: string
  name: string
  slug: string
  depth: number
}

export default async function LandingPage() {
  const [content, footerSettings, dependencies, published, categoryTree, branding] = await Promise.all([
    ShopContentService.getAll(),
    FooterSettingsService.get(),
    getHomepageRenderDependencies(),
    HomepageCmsService.getPublished(),
    CategoryService.getTree(),
    BrandingSettingsService.get(),
  ])

  const flattenCategoryTree = (
    nodes: Array<{ _id: unknown; name: string; slug: string; children?: unknown[] }>,
    depth = 0
  ): FooterCategoryItem[] =>
    nodes.flatMap((node) => {
      const current: FooterCategoryItem = {
        id: String(node._id),
        name: node.name,
        slug: node.slug,
        depth,
      }
      const children = Array.isArray(node.children)
        ? flattenCategoryTree(
            node.children as Array<{ _id: unknown; name: string; slug: string; children?: unknown[] }>,
            depth + 1
          )
        : []
      return [current, ...children]
    })

  const footerCategories = flattenCategoryTree(
    categoryTree as Array<{ _id: unknown; name: string; slug: string; children?: unknown[] }>
  )
  const publishedContactBlock = published.blocks.find((block) => block.type === "contact" && block.enabled !== false)
  const publishedContact = (publishedContactBlock?.data ?? {}) as { email?: string; phone?: string; address?: string }

  return (
    <div className="flex flex-col min-h-screen bg-background-dark selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar brandName={branding.brandName} logoSrc={branding.logoNav} />
      
      <main className="overflow-x-hidden">
        <RealHomepageSections snapshot={published} dependencies={dependencies} />
      </main>

      <Footer
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        categories={footerCategories}
        settings={footerSettings}
        email={publishedContact.email || content.contact_email}
        phone={publishedContact.phone || content.contact_phone}
        address={publishedContact.address || content.contact_address}
      />
    </div>
  )
}
