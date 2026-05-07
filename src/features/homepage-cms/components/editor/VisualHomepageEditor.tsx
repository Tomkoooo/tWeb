"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TopBar } from "@/features/homepage-cms/components/editor/TopBar"
import { Inserter } from "@/features/homepage-cms/components/editor/Inserter"
import { createDefaultBlock, useHomepageEditorStore } from "@/features/homepage-cms/store/editor-store"
import type { HomepageBlock, HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import { discardHomepageDraft, publishHomepageDraft } from "@/features/homepage-cms/api/publish-client"
import { saveHomepageDraft } from "@/features/homepage-cms/api/draft-client"
import { DevicePreview } from "@/features/homepage-cms/components/editor/DevicePreview"
import { Breadcrumb } from "@/features/homepage-cms/components/editor/Breadcrumb"
import { EditableLogo } from "@/features/site-settings/components/EditableLogo"
import { EditableBrandName } from "@/features/site-settings/components/EditableBrandName"
import { SeoEditor } from "@/features/site-settings/components/SeoEditor"
import { RealHomepageSections } from "@/features/homepage-cms/render/RealHomepageSections"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import type { FooterSettings } from "@/services/footer-settings"
import type { SeoSettings } from "@/services/seo-settings"
import { ThemeEditor } from "@/features/theme/components/ThemeEditor"
import type { ThemeTokens } from "@/services/theme"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CmsEditProvider } from "@/features/homepage-cms/components/editor/cms-edit-context"

type Props = {
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
  dependencies: {
    reviews: Array<{ id: string; name: string; role: string; content: string; rating: number; avatar: string }>
    products: Array<{
      id: string
      name: string
      slug: string
      price: number
      image: string
      category: string
      rating: number
      hasVariants: boolean
      requireVariantSelection: boolean
    }>
    categories: Array<{ id: string; name: string; description: string; image: string; slug: string }>
    company: { name: string; address: string; phone: string; email: string }
  }
}

export function VisualHomepageEditor({ initialSnapshot, initialBranding, initialFooter, initialSeo, initialTheme, dependencies }: Props) {
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
    addBlock,
    markSaved,
    undo,
    redo,
  } = useHomepageEditorStore()

  useEffect(() => {
    setSnapshot(initialSnapshot)
  }, [initialSnapshot, setSnapshot])

  const selectedBlock = useMemo(
    () => snapshot.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [snapshot.blocks, selectedBlockId]
  )
  const contactData = useMemo(() => {
    const block = snapshot.blocks.find((item) => item.type === "contact" && item.enabled !== false)
    const data = block?.data as { email?: string; phone?: string; address?: string } | undefined
    return {
      email: data?.email || dependencies.company.email,
      phone: data?.phone || dependencies.company.phone,
      address: data?.address || dependencies.company.address,
    }
  }, [dependencies.company.address, dependencies.company.email, dependencies.company.phone, snapshot.blocks])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        saveHomepageDraft(snapshot).then(() => {
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
  }, [markSaved, redo, snapshot, undo])

  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(async () => {
      try {
        await saveHomepageDraft(snapshot)
        markSaved()
      } catch {
        toast.error("Automatikus mentés sikertelen")
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [dirty, markSaved, snapshot])

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
            await saveHomepageDraft(snapshot)
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
            await publishHomepageDraft()
            toast.success("Közzétéve")
          } catch {
            toast.error("Közzététel sikertelen")
          }
        }}
        onDiscard={async () => {
          try {
            const response = await discardHomepageDraft()
            if (response?.draft) setSnapshot(response.draft)
            toast.success("Piszkozat visszaállítva")
          } catch {
            toast.error("Elvetés sikertelen")
          }
        }}
        onExit={() => router.push("/admin/cms")}
      />
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <div className="px-4 py-3 border-b border-white/10 bg-black/40 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">Globális oldal elemek</p>
            <div className="flex flex-wrap items-end gap-4">
              <EditableLogo
                src={branding.logoNav}
                alt={branding.brandName}
                editMode
                usageLabel="Navbar logo"
                recommendedSize={{ width: 512, height: 160 }}
                onChange={async (value: string) => {
                  const next = { ...branding, logoNav: value }
                  setBranding(next)
                  await fetch("/api/admin/branding", {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ logoNav: value }),
                  })
                }}
              />
              <EditableLogo
                src={branding.logoFooter}
                alt={branding.brandName}
                editMode
                usageLabel="Footer logo"
                recommendedSize={{ width: 512, height: 160 }}
                onChange={async (value: string) => {
                  const next = { ...branding, logoFooter: value }
                  setBranding(next)
                  await fetch("/api/admin/branding", {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ logoFooter: value }),
                  })
                }}
              />
              <EditableBrandName
                value={branding.brandName}
                editMode
                onChange={async (value: string) => {
                  setBranding((prev) => ({ ...prev, brandName: value }))
                  await fetch("/api/admin/branding", {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ brandName: value }),
                  })
                }}
              />
            </div>
          </div>
          <Breadcrumb block={selectedBlock} />
          <div className="p-4 border-b border-white/10"><Inserter onInsert={(type: HomepageBlock["type"]) => addBlock(createDefaultBlock(type), snapshot.blocks.length)} /></div>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {snapshot.blocks.map((block) => (
                <label key={`visible-${block.id}`} className="inline-flex items-center gap-2 text-[11px] text-neutral-300 border border-white/15 px-2 py-1">
                  <input
                    type="checkbox"
                    checked={block.enabled !== false}
                    onChange={(event) => updateBlockField(block.id, "enabled", event.target.checked)}
                  />
                  {block.type}
                </label>
              ))}
            </div>
            <DevicePreview device={device}>
              <CmsEditProvider
                enabled
                snapshot={snapshot}
                updateField={(blockType, field, value) => {
                  const target = snapshot.blocks.find((item) => item.type === blockType && item.enabled !== false)
                  if (!target) return
                  updateBlockField(target.id, field, value)
                }}
              >
                <RealHomepageSections snapshot={snapshot} dependencies={dependencies} />
              </CmsEditProvider>
            </DevicePreview>
          </div>
          <div className="px-4 py-6 border-t border-white/10 bg-black/40">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Lábléc inline szerkesztés</p>
            <Footer
              brandName={branding.brandName}
              logoSrc={branding.logoFooter}
              settings={footerSettings}
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
            <ThemeEditor initial={themeSettings} onSaved={setThemeSettings} />
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
          <div className="min-h-screen bg-background-dark selection:bg-primary selection:text-white overflow-x-hidden">
            <Navbar brandName={branding.brandName} logoSrc={branding.logoNav} />
            <main className="overflow-x-hidden">
              <CmsEditProvider
                enabled={false}
                snapshot={snapshot}
                updateField={(blockType, field, value) => {
                  void blockType
                  void field
                  void value
                }}
              >
                <RealHomepageSections snapshot={snapshot} dependencies={dependencies} />
              </CmsEditProvider>
            </main>
            <Footer
              brandName={branding.brandName}
              logoSrc={branding.logoFooter}
              settings={footerSettings}
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
