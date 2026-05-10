import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import { PageContentService } from "@/services/page-content"
import { getActiveChrome } from "@/lib/active-chrome"
import { resolveStorefrontFooterContact } from "@/lib/storefront-footer-data"

export default async function LandingPage() {
  const { template, branding, footerSettings, shopEnabled, Navbar, Footer, NavbarSearch } =
    await getActiveChrome()
  const homePageDef = template.pages.home

  const [content, homepageDeps] = await Promise.all([
    PageContentService.get(template.manifest.id, "page:home").catch(
      () => homePageDef.defaultContent
    ),
    getHomepageRenderDependencies(),
  ])
  const dependencies = { ...homepageDeps, templateId: template.manifest.id }

  const footerData = await resolveStorefrontFooterContact(template, {
    homepageContent: content,
  })

  const HomeRender = homePageDef.Render

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <Navbar
        brandName={branding.brandName}
        logoSrc={branding.logoNav}
        shopEnabled={shopEnabled}
        NavbarSearch={NavbarSearch}
      />

      <main className="overflow-x-hidden">
        <HomeRender content={content} deps={dependencies} />
      </main>

      <Footer
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        categories={footerData.categories}
        footerSettings={footerSettings}
        shopEnabled={shopEnabled}
        email={footerData.email}
        phone={footerData.phone}
        address={footerData.address}
      />
    </div>
  )
}
