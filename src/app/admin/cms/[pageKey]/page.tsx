import { createHash } from "crypto"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { TemplateService } from "@/services/template"
import { PageContentService } from "@/services/page-content"
import { listEditablePages } from "@/templates/cms-pages"
import { isShopEnabled } from "@/lib/features/shop"
import { getAccessibleCmsSiteSettingsSections } from "@/lib/admin-settings-access"
import { CmsTemplatePageClient } from "@/features/template-cms/components/CmsTemplatePageClient"
import { ShopVisualSurfaceEditor } from "@/features/template-cms/editors/ShopVisualSurfaceEditor"
import { StaticPageVisualSurfaceEditor } from "@/features/template-cms/editors/StaticPageVisualSurfaceEditor"
import { PdpVisualSurfaceEditor } from "@/features/template-cms/editors/PdpVisualSurfaceEditor"
import { FlowShellVisualSurfaceEditor } from "@/features/template-cms/editors/FlowShellVisualSurfaceEditor"
import { CampSurfaceVisualEditor } from "@/features/template-cms/editors/CampSurfaceVisualEditor"
import { HomeVisualSurfaceEditor } from "@/features/template-cms/editors/HomeVisualSurfaceEditor"
import { AdminCmsPageNav } from "@/components/admin/AdminCmsPageNav"
import { PluginService } from "@/services/plugin"
import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import { BrandingSettingsService } from "@/services/branding-settings"
import { FooterSettingsService } from "@/services/footer-settings"
import { SeoSettingsService } from "@/services/seo-settings"
import { getEffectiveThemeBase, ThemeService } from "@/services/theme"
import type { HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import { resolveContactDisplayField } from "@/lib/contact-display"
import type { FlowRouteKey } from "@/templates/types"
import { getShopCmsPreviewDeps, getPdpPreviewProduct } from "@/features/template-cms/resolve-cms-preview-deps"
import type { ShopContent } from "@/templates/default-modern/pages/shop/schema"
import type { PdpContent } from "@/templates/default-modern/pages/pdp/schema"
import type { DefaultModernFlowShellContent } from "@/templates/default-modern/pages/flow/flow-shell-schema"

export const dynamic = "force-dynamic"

const CAMP_PAGE_KEYS = new Set(["page:jegyvasarlas", "page:foglalas", "page:foglalas-siker"])

const FLOW_PAGE_ROUTE: Partial<Record<string, FlowRouteKey>> = {
  "page:cart": "cart",
  "page:checkout": "checkout",
  "page:profile": "profile",
}

function cmsEditorHydrationFingerprint(parts: unknown[]): string {
  const h = createHash("sha256")
  for (const p of parts) {
    h.update(JSON.stringify(p))
  }
  return h.digest("hex").slice(0, 22)
}

export default async function CmsPageEditor({
  params,
}: {
  params: Promise<{ pageKey: string }>
}) {
  const { pageKey } = await params
  const template = await TemplateService.getActive()
  const dbActiveTemplate = await TemplateService.getDbActive()
  const shopEnabled = isShopEnabled()
  const campBookingEnabled = await PluginService.isEnabled("camp-booking")
  const editablePages = listEditablePages(template, shopEnabled, campBookingEnabled)
  const cmsSettingsSections = getAccessibleCmsSiteSettingsSections(shopEnabled)
  const entry = editablePages.find((p) => p.adminSegment === pageKey)
  if (!entry) notFound()

  const fullPageKey = entry.pageKey
  const [dependencies, branding, footer, seo, theme] = await Promise.all([
    getHomepageRenderDependencies(),
    BrandingSettingsService.get(),
    FooterSettingsService.get(),
    SeoSettingsService.get(),
    ThemeService.getMergedForTemplate(dbActiveTemplate),
  ])

  const themeResetBaseline = getEffectiveThemeBase(dbActiveTemplate)

  if (entry.editorKind === "homepage-blocks") {
    if (template.pages.home.cmsPageKind !== "homepage-blocks") notFound()

    const initialDraft = await PageContentService.getDraft(template.manifest.id, fullPageKey)
    const hydratedSnapshot: HomepageSnapshot = {
      ...(initialDraft as HomepageSnapshot),
      blocks: (initialDraft as HomepageSnapshot).blocks.map((block) =>
        block.type === "contact"
          ? {
              ...block,
              data: {
                ...block.data,
                companyName: block.data.companyName || dependencies.company.name,
                address: resolveContactDisplayField(
                  block.data.address,
                  dependencies.company.address
                ),
                phone: resolveContactDisplayField(
                  block.data.phone,
                  dependencies.company.phone
                ),
              },
            }
          : block
      ),
    }

    const editorHydrationKey = cmsEditorHydrationFingerprint([
      template.manifest.id,
      fullPageKey,
      initialDraft,
    ])

    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-4">
          <Link
            href="/admin/cms"
            className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white w-fit"
          >
            ← CMS áttekintés
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                CMS: {entry.label}
              </h1>
              <p className="text-xs text-neutral-500">
                Sablon: <code>{template.manifest.name}</code> · Kulcs: <code>{fullPageKey}</code>
                <span className="ml-2 admin-text-accent">· Blokkos főoldal</span>
              </p>
            </div>
            <AdminCmsPageNav
              editablePages={editablePages}
              activeSegment={pageKey}
              settingsSections={cmsSettingsSections}
            />
          </div>
        </header>

        <CmsTemplatePageClient
          hydrationKey={editorHydrationKey}
          templateId={template.manifest.id}
          shopEnabled={shopEnabled}
          initialSnapshot={hydratedSnapshot}
          initialBranding={branding}
          initialFooter={footer}
          initialTheme={theme}
          dependencies={dependencies}
        />
      </div>
    )
  }

  const initialDraftUnknown = await PageContentService.getDraft(template.manifest.id, fullPageKey)
  const editorHydrationKey = cmsEditorHydrationFingerprint([
    template.manifest.id,
    fullPageKey,
    initialDraftUnknown,
    shopEnabled,
  ])

  switch (fullPageKey) {
    case "page:home": {
      if (entry.editorKind !== "surface-json") notFound()

      return (
        <SurfacePageLayout
          label={entry.label}
          subtitle="Főoldal · JSON felület"
          editablePages={editablePages}
          settingsSections={cmsSettingsSections}
          pageKey={pageKey}
          manifestName={template.manifest.name}
          fullPageKey={fullPageKey}
        >
          <HomeVisualSurfaceEditor
            hydrationKey={editorHydrationKey}
            templateId={template.manifest.id}
            shopEnabled={shopEnabled}
            pageKey={fullPageKey}
            pageLabel={entry.label}
            initialDraft={initialDraftUnknown as Record<string, unknown>}
            branding={branding}
            footer={footer}
            seo={seo}
            theme={theme}
            themeResetBaseline={themeResetBaseline}
            homepageDeps={dependencies}
          />
        </SurfacePageLayout>
      )
    }

    case "page:shop": {
      const initialDraft = initialDraftUnknown as ShopContent
      const shopDeps = await getShopCmsPreviewDeps(template, initialDraft.pageSize, shopEnabled)
      return (
        <SurfacePageLayout
          label={entry.label}
          subtitle="Bolt · szerkesztő"
          editablePages={editablePages}
          settingsSections={cmsSettingsSections}
          pageKey={pageKey}
          manifestName={template.manifest.name}
          fullPageKey={fullPageKey}
        >
          <ShopVisualSurfaceEditor
            hydrationKey={editorHydrationKey}
            templateId={template.manifest.id}
            shopEnabled={shopEnabled}
            pageKey={fullPageKey}
            initialDraft={initialDraft}
            shopDeps={shopDeps}
            branding={branding}
            footer={footer}
            seo={seo}
            theme={theme}
            themeResetBaseline={themeResetBaseline}
            homepageDeps={dependencies}
          />
        </SurfacePageLayout>
      )
    }

    case "page:pdp": {
      const product = await getPdpPreviewProduct()
      const pdpDeps = { product, selectedVariantId: undefined, shopEnabled, templateId: template.manifest.id }
      const initialDraft = initialDraftUnknown as PdpContent
      return (
        <SurfacePageLayout
          label={entry.label}
          subtitle="Termék oldal · keret szerkesztő"
          editablePages={editablePages}
          settingsSections={cmsSettingsSections}
          pageKey={pageKey}
          manifestName={template.manifest.name}
          fullPageKey={fullPageKey}
        >
          <PdpVisualSurfaceEditor
            hydrationKey={editorHydrationKey}
            templateId={template.manifest.id}
            shopEnabled={shopEnabled}
            pageKey={fullPageKey}
            initialDraft={initialDraft}
            pdpDeps={pdpDeps}
            branding={branding}
            footer={footer}
            seo={seo}
            theme={theme}
            themeResetBaseline={themeResetBaseline}
            homepageDeps={dependencies}
          />
        </SurfacePageLayout>
      )
    }

    default: {
      const flowRoute = FLOW_PAGE_ROUTE[fullPageKey]
      if (flowRoute) {
        const initialDraft = initialDraftUnknown as DefaultModernFlowShellContent

        return (
          <SurfacePageLayout
            label={entry.label}
            subtitle="Folyamat oldal · keret szerkesztő"
            editablePages={editablePages}
            settingsSections={cmsSettingsSections}
            pageKey={pageKey}
            manifestName={template.manifest.name}
            fullPageKey={fullPageKey}
          >
            <FlowShellVisualSurfaceEditor
              hydrationKey={editorHydrationKey}
              templateId={template.manifest.id}
              shopEnabled={shopEnabled}
              pageKey={fullPageKey}
              flowRoute={flowRoute}
              initialDraft={initialDraft}
              branding={branding}
              footer={footer}
              seo={seo}
              theme={theme}
              themeResetBaseline={themeResetBaseline}
              homepageDeps={dependencies}
            />
          </SurfacePageLayout>
        )
      }

      const staticSlug = fullPageKey.startsWith("page:") ? fullPageKey.slice("page:".length) : ""
      if (staticSlug && template.staticPages[staticSlug]) {
        return (
          <SurfacePageLayout
            label={entry.label}
            subtitle={`Statikus lap · /${staticSlug}`}
            editablePages={editablePages}
            settingsSections={cmsSettingsSections}
            pageKey={pageKey}
            manifestName={template.manifest.name}
            fullPageKey={fullPageKey}
          >
            <StaticPageVisualSurfaceEditor
              hydrationKey={editorHydrationKey}
              templateId={template.manifest.id}
              shopEnabled={shopEnabled}
              pageKey={fullPageKey}
              slug={staticSlug}
              pageLabel={entry.label}
              initialDraft={initialDraftUnknown as Record<string, unknown>}
              branding={branding}
              footer={footer}
              seo={seo}
              theme={theme}
              themeResetBaseline={themeResetBaseline}
              homepageDeps={dependencies}
            />
          </SurfacePageLayout>
        )
      }

      if (CAMP_PAGE_KEYS.has(fullPageKey) && template.campPages) {
        return (
          <SurfacePageLayout
            label={entry.label}
            subtitle="Tábor foglalás · szövegek"
            editablePages={editablePages}
            settingsSections={cmsSettingsSections}
            pageKey={pageKey}
            manifestName={template.manifest.name}
            fullPageKey={fullPageKey}
          >
            <CampSurfaceVisualEditor
              hydrationKey={editorHydrationKey}
              templateId={template.manifest.id}
              shopEnabled={shopEnabled}
              pageKey={fullPageKey}
              pageLabel={entry.label}
              initialDraft={initialDraftUnknown as Record<string, unknown>}
              branding={branding}
              footer={footer}
              seo={seo}
              theme={theme}
              themeResetBaseline={themeResetBaseline}
              homepageDeps={dependencies}
            />
          </SurfacePageLayout>
        )
      }

      notFound()
    }
  }
}

function SurfacePageLayout({
  label,
  subtitle,
  editablePages,
  settingsSections,
  pageKey,
  manifestName,
  fullPageKey,
  children,
}: {
  label: string
  subtitle: string
  editablePages: ReturnType<typeof listEditablePages>
  settingsSections: Array<{ id: string; label: string }>
  pageKey: string
  manifestName: string
  fullPageKey: string
  children: ReactNode
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <Link
          href="/admin/cms"
          className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white w-fit"
        >
          ← CMS áttekintés
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">CMS: {label}</h1>
            <p className="text-xs text-neutral-500">
              Sablon: <code>{manifestName}</code> · Kulcs: <code>{fullPageKey}</code>
              <span className="ml-2 admin-text-accent">· {subtitle}</span>
            </p>
          </div>
          <AdminCmsPageNav
            editablePages={editablePages}
            activeSegment={pageKey}
            settingsSections={settingsSections}
          />
        </div>
      </header>

      <div>{children}</div>
    </div>
  )
}
