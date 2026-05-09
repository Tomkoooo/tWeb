import { Footer as DefaultModernFooterImpl } from "@/components/layout/Footer"
import type { ChromeProps } from "@/templates/types"
import type { FooterSettings } from "@/services/footer-settings"

type FooterChromeProps = ChromeProps & {
  email?: string
  phone?: string
  address?: string
  categories?: Array<{ id: string; name: string; slug: string; depth: number }>
  footerSettings?: FooterSettings
}

export function Footer({
  brandName,
  logoSrc,
  email,
  phone,
  address,
  categories,
  footerSettings,
}: FooterChromeProps) {
  return (
    <DefaultModernFooterImpl
      brandName={brandName}
      logoSrc={logoSrc}
      email={email}
      phone={phone}
      address={address}
      categories={categories}
      settings={footerSettings}
    />
  )
}
