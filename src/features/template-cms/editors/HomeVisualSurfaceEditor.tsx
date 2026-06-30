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
import { FALLBACK_TEMPLATE_ID, getTemplateById } from "@/templates/registry"
import { getHomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
import type { HomePageDeps } from "@/templates/types"
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

/** JSON surface editor for templates whose home page is not block-based (`cmsPageKind !== "homepage-blocks"`). */
export function HomeVisualSurfaceEditor({
  hydrationKey,
  templateId,
  shopEnabled,
  pageKey,
  pageLabel,
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
  pageLabel: string
  initialDraft: Record<string, unknown>
  branding: Branding
  footer: FooterSettings
  seo: SeoSettings
  theme: ThemeTokens
  themeResetBaseline: ThemeTokens
  homepageDeps: HomepageDeps
}) {
  const router = useRouter()
  const mod = getTemplateById(templateId) ?? getTemplateById(FALLBACK_TEMPLATE_ID)!
  const HomeRender = mod.pages.home.Render

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

  const homeDeps: HomePageDeps = {
    templateId,
    products: homepageDeps.products,
    categories: homepageDeps.categories,
    reviews: homepageDeps.reviews,
    siteContact: homepageDeps.siteContact,
    company: homepageDeps.company,
    shopEnabled,
  }

  const categoriesMapped = homepageDeps.categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    depth: 0,
  }))

  const toolbar = (
    <div className="px-4 py-3 border-b border-white/10 bg-black/25 text-xs text-neutral-400 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-neutral-500">
        Főoldal JSON felület: <span className="text-neutral-200">{pageLabel}</span>
      </p>
      <p>
        Kattintással szerkeszthető szövegek és képek — előnézet mód a jobb oldali eszközöknél.
      </p>
    </div>
  )

  return (
    <DefaultModernVisualCmsChrome
      templateId={templateId}
      shopEnabled={shopEnabled}
      reviewTitle={pageLabel}
      branding={branding}
      initialFooter={initialFooter}
      initialTheme={theme}
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
      contactEmails={homepageDeps.siteContact.emails}
      contactPhone={homepageDeps.company.phone}
      contactAddress={homepageDeps.company.address}
      footerCategories={categoriesMapped}
      toolbarBelowBranding={toolbar}
      renderMain={(ctx) =>
        ctx.mode === "edit" ? (
          <SurfaceDocEditProvider enabled setPath={setPath}>
            <HomeRender content={draft} deps={homeDeps} />
          </SurfaceDocEditProvider>
        ) : (
          <HomeRender content={draft} deps={homeDeps} />
        )
      }
    />
  )
}
