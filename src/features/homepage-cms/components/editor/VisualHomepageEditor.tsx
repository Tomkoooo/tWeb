"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TopBar } from "@/features/homepage-cms/components/editor/TopBar"
import { Inserter } from "@/features/homepage-cms/components/editor/Inserter"
import { createDefaultBlock, useHomepageEditorStore } from "@/features/homepage-cms/store/editor-store"
import type { HeroBlock, HomepageBlockType, HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import { getDefinition } from "@/features/homepage-cms/registry/block-registry"
import {
  insertionIndexForHomepageBlockType,
  resolveAllowedHomepageBlockTypes,
} from "@/features/homepage-cms/utils/homepage-block-allowlist"
import { discardHomepageDraft, publishHomepageDraft } from "@/features/homepage-cms/api/publish-client"
import { saveHomepageDraft } from "@/features/homepage-cms/api/draft-client"
import { DevicePreview } from "@/features/homepage-cms/components/editor/DevicePreview"
import { Breadcrumb } from "@/features/homepage-cms/components/editor/Breadcrumb"
import { CmsChromeBrandingToolbar } from "@/features/template-cms/components/CmsChromeBrandingToolbar"
import { SeoEditor } from "@/features/site-settings/components/SeoEditor"
import { FALLBACK_TEMPLATE_ID, TEMPLATE_REGISTRY } from "@/templates/registry"
import { themeTokensToCssVars } from "@/lib/theme-css-vars"
import type { FooterSettings } from "@/services/footer-settings"
import type { SeoSettings } from "@/services/seo-settings"
import { ThemeEditor } from "@/features/theme/components/ThemeEditor"
import type { ThemeTokens } from "@/services/theme"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CmsEditProvider } from "@/features/homepage-cms/components/editor/cms-edit-context"
import type { HomePageDeps } from "@/templates/types"
import type { HomepageRenderDependencies } from "@/features/homepage-cms/render/homepage-deps"
type Props = {
  templateId: string
  /** Mirrors storefront chrome links (shop/cart) in the template Navbar/Footer. */
  shopEnabled?: boolean
  initialSnapshot: HomepageSnapshot
  initialBranding: {
    brandName: string
    logoNav: string
    logoFooter: string
    logoHero: string
  }
  initialFooter: FooterSettings
  initialSeo: SeoSettings
  initialTheme: ThemeTokens
  /** Template palette baseline for theme reset UX (matches /admin/theme). */
  themeResetBaseline: ThemeTokens
  dependencies: HomepageRenderDependencies
}

export function VisualHomepageEditor({
  templateId,
  shopEnabled = true,
  initialSnapshot,
  initialBranding,
  initialFooter,
  initialSeo,
  initialTheme,
  themeResetBaseline,
  dependencies,
}: Props) {
  const router = useRouter()
  const [branding, setBranding] = useState(initialBranding)
  const [seoSettings, setSeoSettings] = useState(initialSeo)
  const [themeSettings, setThemeSettings] = useState(initialTheme)
  const [footerSettings, setFooterSettings] = useState(initialFooter)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"theme" | "seo">("theme")
  const {
    snapshot,
    selectedBlockId,
    device,
    dirty,
    past,
    future,
    setSnapshot,
    setDevice,
    updateBlockField,
    updateBlockData,
    addBlock,
    markSaved,
    undo,
    redo,
  } = useHomepageEditorStore()

  useEffect(() => {
    setSnapshot(initialSnapshot)
  }, [initialSnapshot, setSnapshot])

  useEffect(() => {
    setThemeSettings(initialTheme)
  }, [initialTheme])

  const selectedBlock = useMemo(
    () => snapshot.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [snapshot.blocks, selectedBlockId]
  )

  const templateModule = TEMPLATE_REGISTRY[templateId] ?? TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]
  const allowedHomepageBlockTypes = useMemo(
    () => resolveAllowedHomepageBlockTypes(templateModule.pages.home),
    [templateModule]
  )
  const insertableBlockTypes = useMemo(
    () => allowedHomepageBlockTypes.filter((t) => !snapshot.blocks.some((b) => b.type === t)),
    [allowedHomepageBlockTypes, snapshot.blocks]
  )
  const NavbarCmp = templateModule.chrome.Navbar
  const FooterCmp = templateModule.chrome.Footer
  const HomeRender = templateModule.pages.home.Render
  const patchHeroTopLevelField = (
    data: HeroBlock["data"],
    field: string,
    value: unknown
  ): Record<string, unknown> | null => {
    const slideKeys = new Set([
      "title",
      "description",
      "primaryCtaLabel",
      "primaryCtaHref",
      "secondaryCtaLabel",
      "secondaryCtaHref",
    ])
    if (!slideKeys.has(field)) return null
    const patch: Record<string, unknown> = { [field]: value }
    if (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
      patch.heroSlides = data.heroSlides.map((slide) => ({ ...slide, [field]: value }))
    }
    return patch
  }

  const contactData = useMemo(() => {
    const block = snapshot.blocks.find((item) => item.type === "contact" && item.enabled !== false)
    const data = block?.data as { email?: string; phone?: string; address?: string } | undefined
    return {
      email: data?.email || dependencies.company.email,
      phone: data?.phone || dependencies.company.phone,
      address: data?.address || dependencies.company.address,
    }
  }, [dependencies.company.address, dependencies.company.email, dependencies.company.phone, snapshot.blocks])

  const homePageDeps = useMemo(
    (): HomePageDeps => ({ ...dependencies, templateId }),
    [dependencies, templateId]
  )

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        saveHomepageDraft(snapshot, templateId).then(() => {
          markSaved()
          toast.success("Piszkozat mentve")
        })
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [markSaved, redo, snapshot, templateId, undo])

  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(async () => {
      try {
        await saveHomepageDraft(snapshot, templateId)
        markSaved()
      } catch {
        toast.error("Automatikus mentés sikertelen")
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [dirty, markSaved, snapshot, templateId])

  useEffect(() => {
    if (!reviewOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setReviewOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [reviewOpen])

  return (
    <div className="min-h-screen bg-background-dark text-white">
      <TopBar
        dirty={dirty}
        device={device}
        onDeviceChange={setDevice}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={undo}
        onRedo={redo}
        onSave={async () => {
          try {
            await saveHomepageDraft(snapshot, templateId)
            markSaved()
            toast.success("Piszkozat mentve")
          } catch {
            toast.error("Piszkozat mentése sikertelen")
          }
        }}
        onReview={() => setReviewOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onPublish={async () => {
          try {
            await saveHomepageDraft(snapshot, templateId)
            markSaved()
            await publishHomepageDraft(templateId)
            toast.success("Közzétéve")
            router.refresh()
          } catch {
            toast.error("Közzététel sikertelen")
          }
        }}
        onDiscard={async () => {
          try {
            await discardHomepageDraft(templateId)
            router.refresh()
            toast.success("Piszkozat elvetve")
          } catch {
            toast.error("Elvetés sikertelen")
          }
        }}
        onExit={() => router.push("/admin/cms")}
      />
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <CmsChromeBrandingToolbar branding={branding} setBranding={setBranding} />
          <Breadcrumb block={selectedBlock} />
          <div className="p-4 border-b border-white/10 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">Szekciók megjelenítése</p>
            <div className="flex flex-wrap gap-2">
              {allowedHomepageBlockTypes.map((sectionType) => {
                const block = snapshot.blocks.find((b) => b.type === sectionType)
                const label = getDefinition(sectionType).label
                return (
                  <label
                    key={sectionType}
                    className="inline-flex cursor-pointer items-center gap-2 text-[11px] text-neutral-300 border border-white/15 px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={block ? block.enabled !== false : false}
                      onChange={(event) => {
                        const on = event.target.checked
                        if (!block && on) {
                          const idx = insertionIndexForHomepageBlockType(
                            snapshot.blocks,
                            sectionType,
                            allowedHomepageBlockTypes
                          )
                          addBlock(createDefaultBlock(sectionType), idx)
                          return
                        }
                        if (block) {
                          updateBlockField(block.id, "enabled", on)
                        }
                      }}
                    />
                    <span>{label}</span>
                  </label>
                )
              })}
            </div>
            <Inserter
              allowedTypes={insertableBlockTypes}
              onInsert={(type: HomepageBlockType) => {
                if (snapshot.blocks.some((b) => b.type === type)) {
                  toast("Ez a szekció már szerepel az oldalon.")
                  return
                }
                const idx = insertionIndexForHomepageBlockType(
                  snapshot.blocks,
                  type,
                  allowedHomepageBlockTypes
                )
                addBlock(createDefaultBlock(type), idx)
              }}
            />
          </div>
          <div className="p-4 space-y-4">
            <DevicePreview device={device}>
              <div
                className="flex min-h-[480px] flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
                style={themeTokensToCssVars(themeSettings)}
              >
                <NavbarCmp
                  brandName={branding.brandName}
                  logoSrc={branding.logoNav}
                  shopEnabled={shopEnabled}
                  cmsChromePreview
                />
                <main className="min-h-0 flex-1 overflow-x-hidden pt-6">
                  <CmsEditProvider
                    enabled
                    snapshot={snapshot}
                    updateField={(blockType, field, value) => {
                      const target = snapshot.blocks.find(
                        (item) => item.type === blockType && item.enabled !== false
                      )
                      if (!target) return
                      if (blockType === "hero" && target.type === "hero") {
                        const heroPatch = patchHeroTopLevelField(
                          target.data as HeroBlock["data"],
                          field,
                          value
                        )
                        if (heroPatch) {
                          updateBlockData(target.id, heroPatch)
                          return
                        }
                      }
                      updateBlockField(target.id, field, value)
                    }}
                    patchBlockData={(blockType, patch) => {
                      const target = snapshot.blocks.find(
                        (item) => item.type === blockType && item.enabled !== false
                      )
                      if (!target) return
                      updateBlockData(target.id, patch)
                    }}
                  >
                    <HomeRender content={snapshot} deps={homePageDeps} />
                  </CmsEditProvider>
                </main>
                <FooterCmp
                  brandName={branding.brandName}
                  logoSrc={branding.logoFooter}
                  shopEnabled={shopEnabled}
                  footerSettings={footerSettings}
                  cmsEditable
                  onSettingsChange={async (next) => {
                    setFooterSettings(next)
                    await fetch("/api/admin/footer", {
                      method: "PUT",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify(next),
                    })
                  }}
                  categories={dependencies.categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    depth: 0,
                  }))}
                  email={contactData.email}
                  phone={contactData.phone}
                  address={contactData.address}
                />
              </div>
            </DevicePreview>
          </div>
        </div>
      </div>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CMS Beállítások</DialogTitle>
            <DialogDescription>Téma és SEO beállítások egy helyen.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSettingsTab("theme")}
              className={`px-3 h-9 border text-xs uppercase ${settingsTab === "theme" ? "border-primary text-white" : "border-white/20 text-neutral-300"}`}
            >
              Téma
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab("seo")}
              className={`px-3 h-9 border text-xs uppercase ${settingsTab === "seo" ? "border-primary text-white" : "border-white/20 text-neutral-300"}`}
            >
              SEO
            </button>
          </div>
          {settingsTab === "theme" ? (
            <ThemeEditor
              initial={themeSettings}
              resetBaseline={themeResetBaseline}
              onSaved={setThemeSettings}
              resetHelpText="Reset uses the active template baseline (same as clearing overrides on /admin/theme)."
            />
          ) : (
            <SeoEditor initial={seoSettings} onSaved={setSeoSettings} />
          )}
        </DialogContent>
      </Dialog>
      {reviewOpen ? (
        <div className="fixed inset-0 z-200 bg-black overflow-y-auto">
          <div className="sticky top-0 z-210 px-4 py-3 border-b border-white/10 bg-black/95 backdrop-blur flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-300">Főoldal előnézet</p>
              <p className="text-[11px] text-neutral-500">Így jelenik meg a főoldal az aktuális CMS piszkozattal.</p>
            </div>
            <button
              type="button"
              onClick={() => setReviewOpen(false)}
              className="px-3 h-9 border border-white/20 text-white text-xs uppercase cursor-pointer"
            >
              Vissza a szerkesztőhöz
            </button>
          </div>
          <div
            className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
            style={themeTokensToCssVars(themeSettings)}
          >
            <NavbarCmp
              brandName={branding.brandName}
              logoSrc={branding.logoNav}
              shopEnabled={shopEnabled}
              cmsChromePreview
            />
            <main className="overflow-x-hidden pt-6">
              <CmsEditProvider
                enabled={false}
                snapshot={snapshot}
                updateField={(blockType, field, value) => {
                  void blockType
                  void field
                  void value
                }}
                patchBlockData={() => undefined}
              >
                <HomeRender content={snapshot} deps={homePageDeps} />
              </CmsEditProvider>
            </main>
            <FooterCmp
              brandName={branding.brandName}
              logoSrc={branding.logoFooter}
              shopEnabled={shopEnabled}
              footerSettings={footerSettings}
              categories={dependencies.categories.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                depth: 0,
              }))}
              email={contactData.email}
              phone={contactData.phone}
              address={contactData.address}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
