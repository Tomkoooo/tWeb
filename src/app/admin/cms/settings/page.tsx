import { Suspense } from "react"
import { TemplateService } from "@/services/template"
import { BrandingSettingsService } from "@/services/branding-settings"
import { FooterSettingsService } from "@/services/footer-settings"
import { SeoSettingsService } from "@/services/seo-settings"
import { ContactEmailsService } from "@/services/contact-emails"
import { getEffectiveThemeBase, ThemeService } from "@/services/theme"
import { parseCmsSiteSettingsSection } from "@/features/template-cms/cms-site-settings"
import { CmsSiteSettingsClient } from "@/features/template-cms/components/CmsSiteSettingsClient"
import { SiteContactChannelsPanel } from "@/features/site-settings/components/SiteContactChannelsPanel"

export const dynamic = "force-dynamic"

export default async function CmsSiteSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const { section: sectionParam } = await searchParams
  const section = parseCmsSiteSettingsSection(sectionParam)

  const dbActiveTemplate = await TemplateService.getDbActive()
  const [theme, seo, branding, footer, contactEmails, invoiceErrorAlertEmails] = await Promise.all([
    ThemeService.getMergedForTemplate(dbActiveTemplate),
    SeoSettingsService.get(),
    BrandingSettingsService.get(),
    FooterSettingsService.get(),
    ContactEmailsService.list(),
    ContactEmailsService.listInvoiceErrorAlertEmails(),
  ])

  const themeResetBaseline = getEffectiveThemeBase(dbActiveTemplate)
  const themeResetHelpText = dbActiveTemplate.defaultTheme
    ? "Visszaállítja a sablon alap színeit."
    : "Visszaállítja a motor alapértelmezett palettáját."

  return (
    <Suspense fallback={<div className="text-neutral-400 text-sm">Betöltés…</div>}>
      {section === "contact" ? <SiteContactChannelsPanel /> : null}
      <CmsSiteSettingsClient
        section={section}
        templateName={dbActiveTemplate.manifest.name}
        initialTheme={theme}
        themeResetBaseline={themeResetBaseline}
        themeResetHelpText={themeResetHelpText}
        initialSeo={seo}
        initialBranding={branding}
        initialFooter={footer}
        initialContactEmails={contactEmails}
        initialInvoiceErrorAlertEmails={invoiceErrorAlertEmails}
      />
    </Suspense>
  )
}
