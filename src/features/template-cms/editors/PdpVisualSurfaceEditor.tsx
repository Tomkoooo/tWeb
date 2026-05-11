"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DefaultModernVisualCmsChrome } from "@/features/template-cms/components/DefaultModernVisualCmsChrome"
import { SurfaceDocEditProvider } from "@/features/template-cms/surface-doc-edit-context"
import { useUndoableJsonDocument } from "@/features/template-cms/hooks/use-undoable-json-document"
import { useSurfaceDraftPersistence } from "@/features/template-cms/hooks/use-surface-draft-persistence"
import {
  discardTemplatePageDraft,
  publishTemplatePageContent,
} from "@/features/template-cms/api/template-page-client-api"
import { FALLBACK_TEMPLATE_ID, TEMPLATE_REGISTRY } from "@/templates/registry"
import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import type { PdpContent } from "@/templates/default-modern/pages/pdp/schema"
import type { PdpPageDeps } from "@/templates/types"
import type { FooterSettings } from "@/services/footer-settings"
import type { SeoSettings } from "@/services/seo-settings"
import type { ThemeTokens } from "@/services/theme"

type Branding = {
  brandName: string
  logoNav: string
  logoFooter: string
  logoHero: string
}

type HomepageDeps = Awaited<ReturnType<typeof getHomepageRenderDependencies>>

export function PdpVisualSurfaceEditor({
  hydrationKey,
  templateId,
  shopEnabled,
  pageKey,
  initialDraft,
  pdpDeps,
  branding,
  footer: initialFooter,
  seo,
  theme,
  themeResetBaseline,
  homepageDeps,
}: {
  hydrationKey: string
  templateId: string
  shopEnabled: boolean
  pageKey: string
  initialDraft: PdpContent
  pdpDeps: PdpPageDeps
  branding: Branding
  footer: FooterSettings
  seo: SeoSettings
  theme: ThemeTokens
  themeResetBaseline: ThemeTokens
  homepageDeps: HomepageDeps
}) {
  const router = useRouter()
  const mod = TEMPLATE_REGISTRY[templateId] ?? TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]
  const PdpRender = mod.pages.pdp.Render

  const { draft, setPath, undo, redo, canUndo, canRedo, dirty, markSynced } = useUndoableJsonDocument(
    initialDraft,
    hydrationKey
  )

  const { persistDraft } = useSurfaceDraftPersistence({
    templateId,
    pageKey,
    draft,
    dirty,
    markSynced,
  })

  const categoriesMapped = homepageDeps.categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    depth: 0,
  }))

  const mergedForRender: PdpContent = {
    ...draft,
    editorial: {
      ...draft.editorial,
      ctaLabel: draft.editorial.ctaLabel?.trim() || draft.ctaLabel,
    },
  }

  const toolbar = (
    <div className="px-4 py-3 border-b border-white/10 bg-black/25 space-y-3">
      <p className="text-[10px] uppercase tracking-widest text-neutral-400">Termék oldal · keret</p>
      <div className="flex flex-wrap gap-4 items-end text-xs text-neutral-200">
        <label className="space-y-1">
          <span className="text-neutral-500">Bevezető helye</span>
          <select
            className="h-9 rounded border border-white/15 bg-black/50 px-2"
            value={draft.introPlacement}
            onChange={(e) =>
              setPath("introPlacement", e.target.value as PdpContent["introPlacement"])
            }
          >
            <option value="aboveGrid">Rács felett</option>
            <option value="belowHero">Hős alatt</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-neutral-500">Galéria</span>
          <select
            className="h-9 rounded border border-white/15 bg-black/50 px-2"
            value={draft.galleryStyle}
            onChange={(e) => setPath("galleryStyle", e.target.value as PdpContent["galleryStyle"])}
          >
            <option value="thumbs">Bélyegképek</option>
            <option value="carousel">Körhinta</option>
          </select>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.showRelatedProducts}
            onChange={(e) => setPath("showRelatedProducts", e.target.checked)}
          />
          Kapcsolódó termékek
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.showRecentlyViewed}
            onChange={(e) => setPath("showRecentlyViewed", e.target.checked)}
          />
          Legutóbb nézett
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex-1 min-w-[160px] space-y-1 text-xs">
          <span className="text-neutral-500">Kosár gomb felirata</span>
          <input
            className="w-full h-9 rounded border border-white/15 bg-black/50 px-2 text-white"
            value={draft.ctaLabel}
            onChange={(e) => setPath("ctaLabel", e.target.value)}
          />
        </label>
        <label className="flex-1 min-w-[160px] space-y-1 text-xs">
          <span className="text-neutral-500">Elfogyott felirat</span>
          <input
            className="w-full h-9 rounded border border-white/15 bg-black/50 px-2 text-white"
            value={draft.outOfStockLabel}
            onChange={(e) => setPath("outOfStockLabel", e.target.value)}
          />
        </label>
      </div>
    </div>
  )

  const hasProduct = Boolean(pdpDeps.product)

  return (
    <DefaultModernVisualCmsChrome
      templateId={templateId}
      shopEnabled={shopEnabled}
      reviewTitle="Termék oldal előnézet"
      branding={branding}
      initialFooter={initialFooter}
      initialSeo={seo}
      initialTheme={theme}
      themeResetBaseline={themeResetBaseline}
      dirty={dirty}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={undo}
      onRedo={redo}
      onSaveDraft={async () => {
        try {
          await persistDraft()
          toast.success("Piszkozat mentve")
        } catch {
          toast.error("Mentés sikertelen")
        }
      }}
      onPublish={async () => {
        try {
          await persistDraft()
          await publishTemplatePageContent(templateId, pageKey)
          toast.success("Közzétéve")
          router.refresh()
        } catch {
          toast.error("Közzététel sikertelen")
        }
      }}
      onDiscard={async () => {
        try {
          await discardTemplatePageDraft(templateId, pageKey)
          toast.success("Piszkozat elvetve")
          router.refresh()
        } catch {
          toast.error("Elvetés sikertelen")
        }
      }}
      contactEmail={homepageDeps.company.email}
      contactPhone={homepageDeps.company.phone}
      contactAddress={homepageDeps.company.address}
      footerCategories={categoriesMapped}
      toolbarBelowBranding={toolbar}
      renderMain={(ctx) =>
        !hasProduct ? (
          <div className="px-8 py-20 text-center text-sm text-neutral-500">
            Nincs előnézetre alkalmas aktív termék a katalógusban — add hozzá legalább egy látható terméket.
          </div>
        ) : ctx.mode === "edit" ? (
          <SurfaceDocEditProvider enabled setPath={setPath}>
            <PdpRender content={mergedForRender} deps={pdpDeps} />
          </SurfaceDocEditProvider>
        ) : (
          <PdpRender content={mergedForRender} deps={pdpDeps} />
        )
      }
    />
  )
}
