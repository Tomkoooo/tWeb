import { TemplateService } from "@/services/template"
import { BrandingSettingsService } from "@/services/branding-settings"
import { FooterSettingsService, type FooterSettings } from "@/services/footer-settings"
import type { TemplateModule } from "@/templates/types"

export type ActiveChrome = {
  template: TemplateModule
  branding: { brandName: string; logoNav: string; logoFooter: string; logoHero: string }
  footerSettings: FooterSettings
  Navbar: TemplateModule["chrome"]["Navbar"]
  Footer: TemplateModule["chrome"]["Footer"]
}

export async function getActiveChrome(): Promise<ActiveChrome> {
  const [template, branding, footerSettings] = await Promise.all([
    TemplateService.getActive(),
    BrandingSettingsService.get(),
    FooterSettingsService.get(),
  ])
  return {
    template,
    branding,
    footerSettings,
    Navbar: template.chrome.Navbar,
    Footer: template.chrome.Footer,
  }
}
