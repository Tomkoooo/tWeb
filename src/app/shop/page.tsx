import { ProductService } from "@/services/product"
import { CategoryService } from "@/services/category"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"
import Link from "next/link"
import { FeatureFlagService } from "@/services/feature-flags"
import { ShopContentService } from "@/services/shop-content"
import { TemplateService } from "@/services/template"
import { PageContentService } from "@/services/page-content"
import { getActiveChrome } from "@/lib/active-chrome"
import type { ShopContent as ShopPageContent } from "@/templates/default-modern/pages/shop/schema"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}): Promise<Metadata> {
  const { q, category } = await searchParams
  const [content, template, shopPageContent] = await Promise.all([
    ShopContentService.getAll(),
    TemplateService.getActive(),
    PageContentService.get<ShopPageContent>("default-modern", "page:shop").catch(
      () => null
    ),
  ])

  void template

  const baseTitle =
    shopPageContent?.meta?.seoTitle ||
    content.shop_seo_title ||
    "Webshop | Krausz Barkácsmester"
  const baseDescription =
    shopPageContent?.meta?.seoDescription ||
    content.shop_seo_description ||
    "Válogasson prémium szerszámaink és ipari gépeink közül. Krausz - A minőség garanciája."

  let title = baseTitle
  let description = baseDescription

  if (q) {
    title = `Keresés: ${q} | Krausz Barkácsmester`
  } else if (category) {
    const cat = await CategoryService.getById(category)
    if (cat) {
      title = `${cat.name} | Krausz Barkácsmester`
      description = cat.seo?.description || description
    }
  }

  return {
    title,
    description,
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    q?: string
    category?: string
    discounted?: string
    sort?: string
  }>
}) {
  const isShopPageEnabled = await FeatureFlagService.isEnabled("shopPage", true)
  const { template, branding, footerSettings, Navbar, Footer } = await getActiveChrome()
  const shopPageDef = template.pages.shop
  const shopContent = await PageContentService.get<ShopPageContent>(
    template.manifest.id,
    "page:shop"
  )

  if (!isShopPageEnabled) {
    return (
      <main className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
        <Navbar brandName={branding.brandName} logoSrc={branding.logoNav} />
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto border border-white/10 bg-white/5 p-10 text-center space-y-6">
            <p className="text-xl font-black uppercase tracking-widest text-white">
              jelenleg nem elérhető vissza a főoldalra
            </p>
            <Link href="/">
              <Button className="rounded-none bg-primary hover:bg-primary/85 text-white font-black uppercase tracking-widest text-xs h-12 px-8">
                Vissza a főoldalra
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const params = await searchParams
  const currentPage = parseInt(params.page || "1")
  const limit = shopContent.pageSize ?? 12

  const filters = {
    search: params.q,
    category: params.category,
    isDiscounted: params.discounted === "true",
    sort: params.sort || "newest",
    isActive: true,
    isVisible: true,
  }

  const [paginationResult, categoriesResult, contentDoc] =
    await Promise.all([
      ProductService.getPaginated(currentPage, limit, filters),
      CategoryService.getTree(),
      ShopContentService.getAll(),
    ])

  const products = JSON.parse(JSON.stringify(paginationResult.products))
  const total = paginationResult.total
  const pages = paginationResult.pages
  const categories = JSON.parse(JSON.stringify(categoriesResult))

  const ShopRender = shopPageDef.Render

  return (
    <>
      <Navbar brandName={branding.brandName} logoSrc={branding.logoNav} />
      <ShopRender
        content={shopContent}
        deps={{
          products,
          categories,
          total,
          pages,
          currentPage,
          query: {
            q: params.q,
            category: params.category,
            discounted: params.discounted === "true",
            sort: params.sort,
            page: currentPage,
          },
        }}
      />
      <Footer
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        footerSettings={footerSettings}
        email={contentDoc.contact_email}
        phone={contentDoc.contact_phone}
        address={contentDoc.contact_address}
      />
    </>
  )
}
