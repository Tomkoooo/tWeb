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
import {
  resolveStorefrontFooterContact,
  type CategoryTreeNode,
} from "@/lib/storefront-footer-data"
import { resolveCommerceProductCard } from "@/templates/resolve-commerce-slots"
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}): Promise<Metadata> {
  const { q, category } = await searchParams
  const template = await TemplateService.getActive()
  const [content, shopPageContent] = await Promise.all([
    ShopContentService.getAll(),
    PageContentService.get(template.manifest.id, "page:shop").catch(() => null),
  ])

  type ShopSeo = { meta?: { seoTitle?: string; seoDescription?: string } }
  const shopMeta = shopPageContent as ShopSeo | null
  const baseTitle =
    shopMeta?.meta?.seoTitle ||
    content.shop_seo_title ||
    "Webshop | Krausz Barkácsmester"
  const baseDescription =
    shopMeta?.meta?.seoDescription ||
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
  const { template, branding, footerSettings, shopEnabled, Navbar, Footer, NavbarSearch } =
    await getActiveChrome()
  const shopPageDef = template.pages.shop
  const shopRaw = await PageContentService.get(template.manifest.id, "page:shop").catch(
    () => shopPageDef.defaultContent
  )
  const shopContent = shopRaw as typeof shopPageDef.defaultContent

  if (!isShopPageEnabled) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-6 text-foreground">
        <Navbar
          brandName={branding.brandName}
          logoSrc={branding.logoNav}
          shopEnabled={shopEnabled}
          NavbarSearch={NavbarSearch}
        />
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl space-y-6 border border-border bg-muted/40 p-10 text-center">
            <p className="text-xl font-black uppercase tracking-widest text-foreground">
              jelenleg nem elérhető vissza a főoldalra
            </p>
            <Link href="/">
              <Button className="h-12 rounded-none bg-primary px-8 font-black uppercase tracking-widest text-xs text-primary-foreground hover:bg-primary/85">
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

  const footerData = await resolveStorefrontFooterContact(template, {
    shopContentSnapshot: contentDoc,
    categoryTreeSnapshot: categoriesResult as CategoryTreeNode[],
  })

  const ShopRender = shopPageDef.Render

  return (
    <>
      <Navbar
        brandName={branding.brandName}
        logoSrc={branding.logoNav}
        shopEnabled={shopEnabled}
        NavbarSearch={NavbarSearch}
      />
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
          shopRendering: { ProductCard: resolveCommerceProductCard(template) },
        }}
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
    </>
  )
}
