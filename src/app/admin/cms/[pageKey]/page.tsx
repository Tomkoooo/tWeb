import { createHash } from "crypto"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { TemplateService } from "@/services/template"
import { PageContentService } from "@/services/page-content"
import { listEditablePages } from "@/templates/cms-pages"
import { isShopEnabled } from "@/lib/features/shop"
import { CmsTemplatePageClient } from "@/features/template-cms/components/CmsTemplatePageClient"
import { ShopVisualSurfaceEditor } from "@/features/template-cms/editors/ShopVisualSurfaceEditor"
import { StaticPageVisualSurfaceEditor } from "@/features/template-cms/editors/StaticPageVisualSurfaceEditor"
import { PdpVisualSurfaceEditor } from "@/features/template-cms/editors/PdpVisualSurfaceEditor"
import { FlowShellVisualSurfaceEditor } from "@/features/template-cms/editors/FlowShellVisualSurfaceEditor"
import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import { BrandingSettingsService } from "@/services/branding-settings"
import { FooterSettingsService } from "@/services/footer-settings"
import { SeoSettingsService } from "@/services/seo-settings"
import { getEffectiveThemeBase, ThemeService } from "@/services/theme"
import type { HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import type { FlowRouteKey } from "@/templates/types"
import { getShopCmsPreviewDeps, getPdpPreviewProduct } from "@/features/template-cms/resolve-cms-preview-deps"
import type { ShopContent } from "@/templates/default-modern/pages/shop/schema"
import type { PdpContent } from "@/templates/default-modern/pages/pdp/schema"
import type { DefaultModernFlowShellContent } from "@/templates/default-modern/pages/flow/flow-shell-schema"

export const dynamic = "force-dynamic"

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
  const editablePages = listEditablePages(template, shopEnabled)
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
                address: block.data.address || dependencies.company.address,
                phone: block.data.phone || dependencies.company.phone,
                email: block.data.email || dependencies.company.email,
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
        <header className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              CMS: {entry.label}
            </h1>
            <p className="text-xs text-neutral-500">
              Sablon: <code>{template.manifest.name}</code> · Kulcs: <code>{fullPageKey}</code>
              <span className="ml-2 text-primary">· Blokkos főoldal</span>
            </p>
          </div>
          <AdminCmsTabs editablePages={editablePages} activeSegment={pageKey} />
        </header>

        <CmsTemplatePageClient
          hydrationKey={editorHydrationKey}
          templateId={template.manifest.id}
          shopEnabled={shopEnabled}
          initialSnapshot={hydratedSnapshot}
          initialBranding={branding}
          initialFooter={footer}
          initialSeo={seo}
          initialTheme={theme}
          themeResetBaseline={themeResetBaseline}
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
    case "page:shop": {
      const initialDraft = initialDraftUnknown as ShopContent
      const shopDeps = await getShopCmsPreviewDeps(template, initialDraft.pageSize)
      return (
        <SurfacePageLayout
          label={entry.label}
          subtitle="Bolt · szerkesztő"
          editablePages={editablePages}
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
      const pdpDeps = { product, selectedVariantId: undefined, templateId: template.manifest.id }
      const initialDraft = initialDraftUnknown as PdpContent
      return (
        <SurfacePageLayout
          label={entry.label}
          subtitle="Termék oldal · keret szerkesztő"
          editablePages={editablePages}
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

      notFound()
    }
  }
}

function AdminCmsTabs({
  editablePages,
  activeSegment,
}: {
  editablePages: ReturnType<typeof listEditablePages>
  activeSegment: string
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {editablePages.map((p) => {
        const isActive = p.adminSegment === activeSegment
        return (
          <Link
            key={p.adminSegment}
            href={`/admin/cms/${p.adminSegment}`}
            className={
              isActive
                ? "rounded-md bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white"
                : "rounded-md border border-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white"
            }
          >
            {p.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SurfacePageLayout({
  label,
  subtitle,
  editablePages,
  pageKey,
  manifestName,
  fullPageKey,
  children,
}: {
  label: string
  subtitle: string
  editablePages: ReturnType<typeof listEditablePages>
  pageKey: string
  manifestName: string
  fullPageKey: string
  children: ReactNode
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">CMS: {label}</h1>
          <p className="text-xs text-neutral-500">
            Sablon: <code>{manifestName}</code> · Kulcs: <code>{fullPageKey}</code>
            <span className="ml-2 text-primary">· {subtitle}</span>
          </p>
        </div>
        <AdminCmsTabs editablePages={editablePages} activeSegment={pageKey} />
      </header>

      <div>{children}</div>
    </div>
  )
}
