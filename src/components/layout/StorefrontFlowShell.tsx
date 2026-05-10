import { getActiveChrome } from "@/lib/active-chrome"
import { resolveStorefrontFooterContact } from "@/lib/storefront-footer-data"

/**
 * Template Navbar + Footer + footer contact data for flow routes (cart, checkout, profile)
 * that are not driven by TemplateModule.pages.{home,shop,pdp} Render delegation.
 */
export default async function StorefrontFlowShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { template, branding, footerSettings, shopEnabled, Navbar, Footer, NavbarSearch } =
    await getActiveChrome()
  const footerData = await resolveStorefrontFooterContact(template)

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <Navbar
        brandName={branding.brandName}
        logoSrc={branding.logoNav}
        shopEnabled={shopEnabled}
        NavbarSearch={NavbarSearch}
      />
      <div className="flex-1 overflow-x-hidden">{children}</div>
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
    </div>
  )
}
