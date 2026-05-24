import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getActiveChrome } from "@/lib/active-chrome"
import { getStorefrontChromeBundle } from "@/lib/storefront-chrome"

export const revalidate = 60
import { PageContentService } from "@/services/page-content"
import { resolveStorefrontFooterContact } from "@/lib/storefront-footer-data"
import { getStorefrontShopName, withStorefrontPageTitle } from "@/lib/storefront-page-title"

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
    const [content, shopName] = await Promise.all([
      PageContentService.get<{
        meta?: { seoTitle?: string; seoDescription?: string }
      }>(template.manifest.id, `page:${slugStr}`),
      getStorefrontShopName(),
    ])
    const seoTitle = content?.meta?.seoTitle?.trim()
    return {
      title: seoTitle ? withStorefrontPageTitle(seoTitle, shopName) : undefined,
      description: content?.meta?.seoDescription || undefined,
    }
  } catch {
    return {}
  }
}

export default async function StaticTemplatePage({ params }: StaticPageProps) {
  const { slug } = await params
  const slugStr = slug.join("/")
  const {
    chrome: { template, branding, footerSettings, shopEnabled, Navbar, Footer, NavbarSearch },
    footerHydration,
  } = await getStorefrontChromeBundle()

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
        contactEmails={footerData.contactEmails}
        phone={footerData.phone}
        address={footerData.address}
        newsletterEnabled={footerHydration.newsletterEnabled}
        legalLinks={footerHydration.legalLinks}
      />
    </>
  )
}
