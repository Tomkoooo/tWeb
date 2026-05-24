import { Footer as DefaultModernFooterImpl } from "@/components/layout/Footer"
import type { ChromeProps, SiteContactEntry } from "@/templates/types"
import type { FooterSettings } from "@/services/footer-settings"

type FooterChromeProps = ChromeProps & {
  email?: string
  contactEmails?: SiteContactEntry[]
  phone?: string
  address?: string
  categories?: Array<{ id: string; name: string; slug: string; depth: number }>
  footerSettings?: FooterSettings
}

export function Footer({
  brandName,
  logoSrc,
  shopEnabled = true,
  email,
  contactEmails = [],
  phone,
  address,
  categories,
  footerSettings,
  cmsEditable,
  onSettingsChange,
}: FooterChromeProps & { cmsEditable?: boolean; onSettingsChange?: (next: FooterSettings) => void | Promise<void> }) {
  return (
    <DefaultModernFooterImpl
      brandName={brandName}
      logoSrc={logoSrc}
      shopEnabled={shopEnabled}
      email={email}
      contactEmails={contactEmails}
      phone={phone}
      address={address}
      categories={categories}
      settings={footerSettings}
      cmsEditable={cmsEditable}
      onSettingsChange={onSettingsChange}
    />
  )
}
