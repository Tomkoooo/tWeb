import { cache } from "react"
import {
  getRequestActiveTemplateInfo,
  getRequestBrandingSettings,
  getRequestFooterSettings,
} from "@/lib/cached-storefront"
import { isShopEnabled } from "@/lib/features/shop"
import { resolveCommerceSlots } from "@/templates/resolve-commerce-slots"
import { readPreviewTemplateId } from "@/services/template-preview"
import { loadTemplateModule } from "@/templates/registry"
import { timeDevMetric } from "@/lib/dev-metrics"
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
  const [previewTemplateId, activeInfo, branding, footerSettings] = await Promise.all([
    timeDevMetric("activeChrome.previewTemplate", () => readPreviewTemplateId(), { category: "page-data" }),
    timeDevMetric("activeChrome.templateInfo", () => getRequestActiveTemplateInfo(), { category: "page-data" }),
    timeDevMetric("activeChrome.branding", () => getRequestBrandingSettings(), { category: "page-data" }),
    timeDevMetric("activeChrome.footerSettings", () => getRequestFooterSettings(), { category: "page-data" }),
  ])
  const template = await timeDevMetric(
    "activeChrome.templateModule",
    () => loadTemplateModule(previewTemplateId ?? activeInfo.templateId),
    { category: "page-data", metadata: { templateId: previewTemplateId ?? activeInfo.templateId } }
  )
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
