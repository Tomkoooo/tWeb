import { cache } from "react"
import { TemplateService } from "@/services/template"
import { BrandingSettingsService } from "@/services/branding-settings"
import { FooterSettingsService, type FooterSettings } from "@/services/footer-settings"
import { isShopEnabled } from "@/lib/features/shop"
import { resolveCommerceSlots } from "@/templates/resolve-commerce-slots"
import type { NavbarSearchSlotProps, TemplateModule } from "@/templates/types"
import type { ComponentType } from "react"

export type ActiveChrome = {
  template: TemplateModule
  branding: { brandName: string; logoNav: string; logoFooter: string; logoHero: string }
  footerSettings: FooterSettings
  shopEnabled: boolean
  Navbar: TemplateModule["chrome"]["Navbar"]
  Footer: TemplateModule["chrome"]["Footer"]
  /** From `commerceSlots.NavbarSearch` when set — pass through to chrome `Navbar` as `NavbarSearch`. */
  NavbarSearch?: ComponentType<NavbarSearchSlotProps>
}

export const getActiveChrome = cache(async function getActiveChrome(): Promise<ActiveChrome> {
  const [template, branding, footerSettings] = await Promise.all([
    TemplateService.getActive(),
    BrandingSettingsService.get(),
    FooterSettingsService.get(),
  ])
  const shopEnabled = isShopEnabled()
  const { NavbarSearch } = resolveCommerceSlots(template)
  return {
    template,
    branding,
    footerSettings,
    shopEnabled,
    Navbar: template.chrome.Navbar,
    Footer: template.chrome.Footer,
    NavbarSearch,
  }
})
