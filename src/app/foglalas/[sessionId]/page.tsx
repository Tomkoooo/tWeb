import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PluginService } from "@/services/plugin"
import { getActiveChrome } from "@/lib/active-chrome"
import { getStorefrontFooterHydrationProps } from "@/lib/storefront-footer-props"
import { resolveStorefrontFooterContact } from "@/lib/storefront-footer-data"
import { CampBookingWizard } from "@/plugins/camp-booking/storefront/CampBookingWizard"
import { pressStart2P } from "@/templates/minecraft-camp/fonts"
import { loadMineshowSiteConfig } from "@/templates/minecraft-camp/lib/load-site-config"
import { getCampBookingContent } from "@/lib/camp-page-content"

type Props = { params: Promise<{ sessionId: string }> }

export default async function FoglalasPage({ params }: Props) {
  const enabled = await PluginService.isEnabled("camp-booking")
  if (!enabled) notFound()

  const { sessionId } = await params
  const chrome = await getActiveChrome()
  const [footerData, footerHydration] = await Promise.all([
    resolveStorefrontFooterContact(chrome.template),
    getStorefrontFooterHydrationProps(),
  ])
  const { branding, footerSettings, Navbar, Footer, NavbarSearch, template } = chrome
  const mineshowSite = await loadMineshowSiteConfig(template.manifest.id)
  const bookingCopy = await getCampBookingContent(template.manifest.id)

  return (
    <>
      <Navbar
        brandName={branding.brandName}
        logoSrc={branding.logoNav}
        shopEnabled={false}
        NavbarSearch={NavbarSearch}
        venueBadge={mineshowSite?.venueShort}
      />
      <main className={`minecraft-page-mineshow min-h-[70vh] py-10 ${pressStart2P.variable}`}>
        <Suspense fallback={<p className="text-center">Betöltés…</p>}>
          <CampBookingWizard sessionId={sessionId} copy={bookingCopy} />
        </Suspense>
      </main>
      <Footer
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        shopEnabled={false}
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
