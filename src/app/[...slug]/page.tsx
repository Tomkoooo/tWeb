import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getActiveChrome } from "@/lib/active-chrome"
import { PageContentService } from "@/services/page-content"
import { CategoryService } from "@/services/category"
import { ShopContentService } from "@/services/shop-content"

type StaticPageProps = {
  params: Promise<{ slug: string[] }>
}

type FooterCategoryItem = {
  id: string
  name: string
  slug: string
  depth: number
}

function flattenCategoryTree(
  nodes: Array<{ _id: unknown; name: string; slug: string; children?: unknown[] }>,
  depth = 0
): FooterCategoryItem[] {
  return nodes.flatMap((node) => {
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
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { slug } = await params
  const slugStr = slug.join("/")
  const { template } = await getActiveChrome()
  const def = template.staticPages[slugStr]
  if (!def) return {}
  try {
    const content = await PageContentService.get<{
      meta?: { seoTitle?: string; seoDescription?: string }
    }>(template.manifest.id, `page:${slugStr}`)
    return {
      title: content?.meta?.seoTitle || undefined,
      description: content?.meta?.seoDescription || undefined,
    }
  } catch {
    return {}
  }
}

export default async function StaticTemplatePage({ params }: StaticPageProps) {
  const { slug } = await params
  const slugStr = slug.join("/")
  const { template, branding, footerSettings, Navbar, Footer } = await getActiveChrome()

  const def = template.staticPages[slugStr]
  if (!def) {
    notFound()
  }

  const [content, categoryTree, shopContent] = await Promise.all([
    PageContentService.get(template.manifest.id, `page:${slugStr}`),
    CategoryService.getTree(),
    ShopContentService.getAll(),
  ])
  const Render = def.Render

  const footerCategories = flattenCategoryTree(
    categoryTree as Array<{ _id: unknown; name: string; slug: string; children?: unknown[] }>
  )

  return (
    <>
      <Navbar brandName={branding.brandName} logoSrc={branding.logoNav} />
      <Render content={content} deps={{ branding }} />
      <Footer
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        categories={footerCategories}
        footerSettings={footerSettings}
        email={shopContent.contact_email}
        phone={shopContent.contact_phone}
        address={shopContent.contact_address}
      />
    </>
  )
}
