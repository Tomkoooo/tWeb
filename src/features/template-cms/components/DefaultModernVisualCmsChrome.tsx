"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/features/homepage-cms/components/editor/TopBar"
import { DevicePreview } from "@/features/homepage-cms/components/editor/DevicePreview"
import { CmsChromeBrandingToolbar } from "@/features/template-cms/components/CmsChromeBrandingToolbar"
import { FALLBACK_TEMPLATE_ID, TEMPLATE_REGISTRY } from "@/templates/registry"
import { themeTokensToCssVars } from "@/lib/theme-css-vars"
import type { FooterSettings } from "@/services/footer-settings"
import type { ContactEmailEntry } from "@/lib/contact-emails"
import type { ThemeTokens } from "@/services/theme"

type Branding = {
  brandName: string
  logoNav: string
  logoFooter: string
  logoHero: string
}

type FooterCategory = { id: string; name: string; slug: string; depth: number }

export type VisualCmsChromeCtx = {
  /** Fullscreen review uses desktop width; inline edit uses DevicePreview device. */
  mode: "edit" | "review"
  Navbar: (typeof TEMPLATE_REGISTRY)["default-modern"]["chrome"]["Navbar"]
  Footer: (typeof TEMPLATE_REGISTRY)["default-modern"]["chrome"]["Footer"]
  branding: Branding
  footerSettings: FooterSettings
  themeSettings: ThemeTokens
  setBranding: React.Dispatch<React.SetStateAction<Branding>>
  setFooterSettings: React.Dispatch<React.SetStateAction<FooterSettings>>
}

export function DefaultModernVisualCmsChrome({
  templateId,
  shopEnabled = true,
  reviewTitle,
  branding: initialBranding,
  initialFooter,
  initialTheme,
  dirty,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveDraft,
  onPublish,
  onDiscard,
  contactEmail,
  contactEmails,
  contactPhone,
  contactAddress,
  footerCategories,
  toolbarBelowBranding,
  renderMain,
}: {
  templateId: string
  shopEnabled?: boolean
  reviewTitle: string
  branding: Branding
  initialFooter: FooterSettings
  initialTheme: ThemeTokens
  dirty: boolean
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onSaveDraft: () => Promise<void>
  onPublish: () => Promise<void>
  onDiscard: () => Promise<void>
  contactEmail: string
  contactEmails: ContactEmailEntry[]
  contactPhone: string
  contactAddress: string
  footerCategories: FooterCategory[]
  toolbarBelowBranding?: React.ReactNode
  renderMain: (ctx: VisualCmsChromeCtx) => React.ReactNode
}) {
  const router = useRouter()
  const [branding, setBranding] = useState(initialBranding)
  const [footerSettings, setFooterSettings] = useState(initialFooter)
  const [themeSettings, setThemeSettings] = useState(initialTheme)
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [reviewOpen, setReviewOpen] = useState(false)

  useEffect(() => {
    setThemeSettings(initialTheme)
  }, [initialTheme])

  useEffect(() => {
    if (!reviewOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setReviewOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [reviewOpen])

  const mod = TEMPLATE_REGISTRY[templateId] ?? TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]
  const NavbarCmp = mod.chrome.Navbar
  const FooterCmp = mod.chrome.Footer

  const wrapLayout = (mode: "edit" | "review", main: React.ReactNode) => (
    <>
      <NavbarCmp
        brandName={branding.brandName}
        logoSrc={branding.logoNav}
        shopEnabled={shopEnabled}
        cmsChromePreview
      />
      {/* Shop-style mains use pt-32 for a fixed storefront bar; shrink that under in-flow CMS preview. */}
      <div className="min-h-0 flex-1 overflow-x-hidden [&>main.min-h-screen]:!pt-8">{main}</div>
      <FooterCmp
        brandName={branding.brandName}
        logoSrc={branding.logoFooter}
        shopEnabled={shopEnabled}
        footerSettings={footerSettings}
        cmsEditable={mode === "edit"}
        onSettingsChange={
          mode === "edit"
            ? async (next) => {
                setFooterSettings(next)
                await fetch("/api/admin/footer", {
                  method: "PUT",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify(next),
                })
              }
            : undefined
        }
        categories={footerCategories}
        email={contactEmail}
        contactEmails={contactEmails}
        phone={contactPhone}
        address={contactAddress}
      />
    </>
  )

  const ctxEdit: VisualCmsChromeCtx = {
    mode: "edit",
    Navbar: NavbarCmp,
    Footer: FooterCmp,
    branding,
    footerSettings,
    themeSettings,
    setBranding,
    setFooterSettings,
  }

  const ctxReview: VisualCmsChromeCtx = {
    mode: "review",
    Navbar: NavbarCmp,
    Footer: FooterCmp,
    branding,
    footerSettings,
    themeSettings,
    setBranding,
    setFooterSettings,
  }

  const mainEdit = renderMain(ctxEdit)
  const mainReview = renderMain(ctxReview)

  return (
    <div className="min-h-screen bg-background-dark text-white">
      <TopBar
        dirty={dirty}
        device={device}
        onDeviceChange={setDevice}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onSave={onSaveDraft}
        onReview={() => setReviewOpen(true)}
        onOpenSettings={() => router.push("/admin/cms/settings?section=theme")}
        onPublish={onPublish}
        onDiscard={onDiscard}
        onExit={() => router.push("/admin/cms")}
      />

      <div className="flex-1 min-w-0">
        <CmsChromeBrandingToolbar branding={branding} setBranding={setBranding} />

        {toolbarBelowBranding}

        <div className="p-4 space-y-4">
          <DevicePreview device={device}>
            <div
              className="flex min-h-[480px] flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
              style={themeTokensToCssVars(themeSettings)}
            >
              {wrapLayout("edit", mainEdit)}
            </div>
          </DevicePreview>
        </div>
      </div>

      {reviewOpen ? (
        <div className="fixed inset-0 z-200 bg-black overflow-y-auto">
          <div className="sticky top-0 z-210 px-4 py-3 border-b border-white/10 bg-black/95 backdrop-blur flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-neutral-300">{reviewTitle}</p>
            <button
              type="button"
              onClick={() => setReviewOpen(false)}
              className="px-3 h-9 border border-white/20 text-white text-xs uppercase cursor-pointer"
            >
              Vissza
            </button>
          </div>
          <div
            className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground"
            style={themeTokensToCssVars(themeSettings)}
          >
            {wrapLayout("review", mainReview)}
          </div>
        </div>
      ) : null}
    </div>
  )
}
