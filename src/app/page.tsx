import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import { HomepageCmsService } from "@/services/homepage-cms"
import { CategoryService } from "@/services/category"
import { ShopContentService } from "@/services/shop-content"
import { PageContentService } from "@/services/page-content"
import { getActiveChrome } from "@/lib/active-chrome"
import type { HomeContent } from "@/templates/default-modern/pages/home/schema"

type FooterCategoryItem = {
  id: string
  name: string
  slug: string
  depth: number
}

export default async function LandingPage() {
  const { template, branding, footerSettings, Navbar, Footer } = await getActiveChrome()
  const homePageDef = template.pages.home

  const [content, dependencies, categoryTree, shopContent] = await Promise.all([
    PageContentService.get<HomeContent>(template.manifest.id, "page:home").catch(
      () => homePageDef.defaultContent as HomeContent
    ),
    getHomepageRenderDependencies(),
    CategoryService.getTree(),
    ShopContentService.getAll(),
  ])

  // Migration shim: while default-modern still uses the legacy
  // homepage_snapshot_published key, fall back to it if no TemplateContent
  // doc exists yet. This keeps existing shops rendering during the rollout.
  const isDefaultContent = content === homePageDef.defaultContent
  const finalContent =
    template.manifest.id === "default-modern" && isDefaultContent
      ? ((await HomepageCmsService.getPublished()) as HomeContent)
      : content

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
            node.children as Array<{
              _id: unknown
              name: string
              slug: string
              children?: unknown[]
            }>,
            depth + 1
          )
        : []
      return [current, ...children]
    })

  const footerCategories = flattenCategoryTree(
    categoryTree as Array<{ _id: unknown; name: string; slug: string; children?: unknown[] }>
  )

  // The "contact" block is a default-modern-specific concept: in that template
  // the home page CMS lets the admin override footer contact info by editing
  // the contact block. Other templates use shopContent.contact_* directly.
  type PublishedContact = { email?: string; phone?: string; address?: string }
  let publishedContact: PublishedContact = {}
  if (template.manifest.id === "default-modern") {
    const blocks = (finalContent as HomeContent | undefined)?.blocks
    if (Array.isArray(blocks)) {
      const block = blocks.find(
        (b) => b.type === "contact" && b.enabled !== false
      )
      publishedContact = (block?.data ?? {}) as PublishedContact
    }
  }

  const HomeRender = homePageDef.Render

  return (
    <div className="flex flex-col min-h-screen bg-background-dark selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar brandName={branding.brandName} logoSrc={branding.logoNav} />

      <main className="overflow-x-hidden">
        <HomeRender content={finalContent} deps={dependencies} />
      </main>

      <Footer
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        categories={footerCategories}
        footerSettings={footerSettings}
        email={publishedContact.email || shopContent.contact_email}
        phone={publishedContact.phone || shopContent.contact_phone}
        address={publishedContact.address || shopContent.contact_address}
      />
    </div>
  )
}
