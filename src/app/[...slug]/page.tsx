import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getActiveChrome } from "@/lib/active-chrome"
import { PageContentService } from "@/services/page-content"
import { resolveStorefrontFooterContact } from "@/lib/storefront-footer-data"

type StaticPageProps = {
  params: Promise<{ slug: string[] }>
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
  const { template, branding, footerSettings, shopEnabled, Navbar, Footer, NavbarSearch } =
    await getActiveChrome()

  const def = template.staticPages[slugStr]
  if (!def) {
    notFound()
  }

  const [content, footerData] = await Promise.all([
    PageContentService.get(template.manifest.id, `page:${slugStr}`),
    resolveStorefrontFooterContact(template),
  ])
  const Render = def.Render

  return (
    <>
      <Navbar
        brandName={branding.brandName}
        logoSrc={branding.logoNav}
        shopEnabled={shopEnabled}
        NavbarSearch={NavbarSearch}
      />
      <Render content={content} deps={{ branding }} />
      <Footer
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        shopEnabled={shopEnabled}
        categories={footerData.categories}
        footerSettings={footerSettings}
        email={footerData.email}
        phone={footerData.phone}
        address={footerData.address}
      />
    </>
  )
}
