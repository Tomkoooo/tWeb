import { Navbar as DefaultModernNavbarImpl } from "@/components/layout/Navbar"
import type { ChromeProps } from "@/templates/types"

export function Navbar({
  brandName,
  logoSrc,
  shopEnabled = true,
  cmsChromePreview,
  NavbarSearch,
}: ChromeProps) {
  return (
    <DefaultModernNavbarImpl
      brandName={brandName}
      logoSrc={logoSrc}
      shopEnabled={shopEnabled}
      cmsChromePreview={cmsChromePreview}
      NavbarSearch={NavbarSearch}
    />
  )
}
