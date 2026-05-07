import { VisualHomepageEditor } from "@/features/homepage-cms/components/editor/VisualHomepageEditor"
import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import { BrandingSettingsService } from "@/services/branding-settings"
import { HomepageCmsService } from "@/services/homepage-cms"
import { FooterSettingsService } from "@/services/footer-settings"
import { SeoSettingsService } from "@/services/seo-settings"
import { ThemeService } from "@/services/theme"

export default async function AdminCMS() {
  const [dependencies, branding, snapshot, footer, seo, theme] = await Promise.all([
    getHomepageRenderDependencies(),
    BrandingSettingsService.get(),
    HomepageCmsService.getDraft(),
    FooterSettingsService.get(),
    SeoSettingsService.get(),
    ThemeService.get(),
  ])
  const hydratedSnapshot = {
    ...snapshot,
    blocks: snapshot.blocks.map((block) =>
      block.type === "contact"
        ? {
            ...block,
            data: {
              ...block.data,
              companyName: block.data.companyName || dependencies.company.name,
              address: block.data.address || dependencies.company.address,
              phone: block.data.phone || dependencies.company.phone,
              email: block.data.email || dependencies.company.email,
            },
          }
        : block
    ),
  }
  return (
    <VisualHomepageEditor
      initialSnapshot={hydratedSnapshot}
      initialBranding={branding}
      initialFooter={footer}
      initialSeo={seo}
      initialTheme={theme}
      dependencies={dependencies}
    />
  )
}

