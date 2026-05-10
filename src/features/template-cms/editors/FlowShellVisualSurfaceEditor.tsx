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
import { FlowRouteInteractivePreview } from "@/features/flow-cms/FlowRouteInteractivePreview"
import { FALLBACK_TEMPLATE_ID, TEMPLATE_REGISTRY } from "@/templates/registry"
import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import type { FlowRouteKey } from "@/templates/types"
import type { FooterSettings } from "@/services/footer-settings"
import type { SeoSettings } from "@/services/seo-settings"
import type { ThemeTokens } from "@/services/theme"
import type { DefaultModernFlowShellContent } from "@/templates/default-modern/pages/flow/flow-shell-schema"

type Branding = {
  brandName: string
  logoNav: string
  logoFooter: string
  logoHero: string
}

type HomepageDeps = Awaited<ReturnType<typeof getHomepageRenderDependencies>>

export function FlowShellVisualSurfaceEditor({
  hydrationKey,
  templateId,
  shopEnabled,
  pageKey,
  flowRoute,
  initialDraft,
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
  flowRoute: FlowRouteKey
  initialDraft: DefaultModernFlowShellContent
  branding: Branding
  footer: FooterSettings
  seo: SeoSettings
  theme: ThemeTokens
  themeResetBaseline: ThemeTokens
  homepageDeps: HomepageDeps
}) {
  const router = useRouter()
  const mod = TEMPLATE_REGISTRY[templateId] ?? TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]
  const flowDef = mod.flowPages![flowRoute]!
  const Wrapper = flowDef.Wrapper
  const Shell = flowDef.shell!.Shell

  const flowDeps = {
    branding: {
      brandName: branding.brandName,
      logoNav: branding.logoNav,
      logoFooter: branding.logoFooter,
    },
  }

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

  const toolbar = (
    <div className="px-4 py-3 border-b border-white/10 bg-black/25">
      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Folyamat oldal felirat</p>
      <p className="text-xs text-neutral-500">
        A működő kosár/pénztár/fiók UI előnézet a lenti ablakban. A fejléc szövege szerkeszthető közvetlenül
        az oldalon.
      </p>
    </div>
  )

  return (
    <DefaultModernVisualCmsChrome
      templateId={templateId}
      shopEnabled={shopEnabled}
      reviewTitle={`${flowRoute} előnézet`}
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
        ctx.mode === "edit" ? (
          <SurfaceDocEditProvider enabled setPath={setPath}>
            <Wrapper>
              <Shell content={draft} deps={flowDeps}>
                <FlowRouteInteractivePreview route={flowRoute} />
              </Shell>
            </Wrapper>
          </SurfaceDocEditProvider>
        ) : (
          <Wrapper>
            <Shell content={draft} deps={flowDeps}>
              <FlowRouteInteractivePreview route={flowRoute} />
            </Shell>
          </Wrapper>
        )
      }
    />
  )
}
