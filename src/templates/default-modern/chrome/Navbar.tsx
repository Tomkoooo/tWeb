import { Navbar as DefaultModernNavbarImpl } from "@/components/layout/Navbar"
import type { ChromeProps } from "@/templates/types"

export function Navbar({ brandName, logoSrc }: ChromeProps) {
  return <DefaultModernNavbarImpl brandName={brandName} logoSrc={logoSrc} />
}
