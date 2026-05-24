import { getHomepagePageData } from "@/lib/homepage-page-data"
import { getStorefrontFooterHydrationProps } from "@/lib/storefront-footer-props"

export const revalidate = 60

export default async function LandingPage() {
  const [{ chrome, content, dependencies, footerData }, footerHydration] = await Promise.all([
    getHomepagePageData(),
    getStorefrontFooterHydrationProps(),
  ])

  const { template, branding, footerSettings, shopEnabled, Navbar, Footer, NavbarSearch } = chrome
  const HomeRender = template.pages.home.Render

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
        contactEmails={footerData.contactEmails}
        phone={footerData.phone}
        address={footerData.address}
        newsletterEnabled={footerHydration.newsletterEnabled}
        legalLinks={footerHydration.legalLinks}
      />
    </div>
  )
}
