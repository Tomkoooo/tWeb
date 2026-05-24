import { cache } from "react"
import { TemplateService } from "@/services/template"
import {
  getRequestBrandingSettings,
  getRequestFooterSettings,
} from "@/lib/cached-storefront"
import { isShopEnabled } from "@/lib/features/shop"
import { resolveCommerceSlots } from "@/templates/resolve-commerce-slots"
import type { NavbarSearchSlotProps, TemplateModule } from "@/templates/types"
import type { ComponentType } from "react"

export type ActiveChrome = {
  template: TemplateModule
  branding: { brandName: string; logoNav: string; logoFooter: string; logoHero: string }
  footerSettings: Awaited<ReturnType<typeof getRequestFooterSettings>>
  shopEnabled: boolean
  Navbar: TemplateModule["chrome"]["Navbar"]
  Footer: TemplateModule["chrome"]["Footer"]
  NavbarSearch?: ComponentType<NavbarSearchSlotProps>
}

export const getActiveChrome = cache(async function getActiveChrome(): Promise<ActiveChrome> {
  const [template, branding, footerSettings] = await Promise.all([
    TemplateService.getActive(),
    getRequestBrandingSettings(),
    getRequestFooterSettings(),
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
