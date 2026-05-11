import { ProductService } from "@/services/product"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { resolveProductView } from "@/lib/product-variants"
import { mediaImageSrc } from "@/lib/images"
import { getActiveChrome } from "@/lib/active-chrome"
import { PageContentService } from "@/services/page-content"
import { resolveStorefrontFooterContact } from "@/lib/storefront-footer-data"
export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const query = await searchParams
  const selectedVariantId = typeof query.variant === "string" ? query.variant : null
  const product = await ProductService.getBySlug(slug)

  if (!product) return { title: "Termék nem található" }
  const view = resolveProductView(product as never, selectedVariantId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://krauszbarkacs.hu"
  const canonicalUrl = `${appUrl}/products/${product.slug}`
  const openGraphImage = view.images?.[0] || product.images?.[0]

  return {
    title: `${view.seo.title || product.name} | Krausz Barkács`,
    description: view.seo.description || product.description.substring(0, 160),
    keywords: view.seo.keywords?.join(", "),
    openGraph: {
      title: view.name || product.name,
      description: view.seo.description || product.description.substring(0, 160),
      images: [mediaImageSrc(openGraphImage)],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ variant?: string }>
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params
  const query = await searchParams
  const selectedVariantId = typeof query.variant === "string" ? query.variant : undefined
  const { template, branding, footerSettings, shopEnabled, Navbar, Footer, NavbarSearch } =
    await getActiveChrome()

  const [product, pdpContent, footerData] = await Promise.all([
    ProductService.getBySlug(slug),
    PageContentService.get(template.manifest.id, "page:pdp"),
    resolveStorefrontFooterContact(template),
  ])

  if (!product) {
    notFound()
  }

  const PdpRender = template.pages.pdp.Render

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar
        brandName={branding.brandName}
        logoSrc={branding.logoNav}
        shopEnabled={shopEnabled}
        NavbarSearch={NavbarSearch}
      />
      <PdpRender
        content={pdpContent}
        deps={{ product, selectedVariantId, templateId: template.manifest.id }}
      />
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
    </main>
  )
}
