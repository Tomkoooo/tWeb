"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { FooterSettings } from "@/services/footer-settings"

export function FooterEditor({ initial }: { initial: FooterSettings }) {
  const [state, setState] = useState<FooterSettings>(initial)
  const socialLabels: Record<string, string> = {
    facebook: "Facebook oldal URL",
    instagram: "Instagram profil URL",
    twitter: "Twitter/X URL",
    youtube: "YouTube csatorna URL",
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-neutral-400">tagline</span>
          <input value={state.tagline} onChange={(event) => setState((prev) => ({ ...prev, tagline: event.target.value }))} className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-neutral-400">quickLinksTitle</span>
          <input value={state.quickLinksTitle} onChange={(event) => setState((prev) => ({ ...prev, quickLinksTitle: event.target.value }))} className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-neutral-400">contactTitle</span>
          <input value={state.contactTitle} onChange={(event) => setState((prev) => ({ ...prev, contactTitle: event.target.value }))} className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-neutral-400">newsletterLabel</span>
          <input value={state.newsletterLabel} onChange={(event) => setState((prev) => ({ ...prev, newsletterLabel: event.target.value }))} className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-neutral-400">newsletterPlaceholder</span>
          <input value={state.newsletterPlaceholder} onChange={(event) => setState((prev) => ({ ...prev, newsletterPlaceholder: event.target.value }))} className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm" />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-widest text-neutral-400">copyrightText</span>
          <input value={state.copyrightText} onChange={(event) => setState((prev) => ({ ...prev, copyrightText: event.target.value }))} className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm" />
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-neutral-400">quickLinks</p>
        {state.quickLinks.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex gap-2">
            <input value={item.label} onChange={(event) => setState((prev) => ({ ...prev, quickLinks: prev.quickLinks.map((current, idx) => (idx === index ? { ...current, label: event.target.value } : current)) }))} className="h-9 px-2 bg-black border border-white/20 text-white text-sm" placeholder="Label" />
            <input value={item.href} onChange={(event) => setState((prev) => ({ ...prev, quickLinks: prev.quickLinks.map((current, idx) => (idx === index ? { ...current, href: event.target.value } : current)) }))} className="flex-1 h-9 px-2 bg-black border border-white/20 text-white text-sm" placeholder="Href" />
            <button type="button" onClick={() => setState((prev) => ({ ...prev, quickLinks: prev.quickLinks.filter((_, idx) => idx !== index) }))} className="px-3 h-9 border border-red-500/60 text-red-200 text-xs uppercase">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => setState((prev) => ({ ...prev, quickLinks: [...prev.quickLinks, { label: "Uj link", href: "#" }] }))} className="px-3 h-9 border border-white/20 text-white text-xs uppercase">Add link</button>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-neutral-400">socialLinks</p>
        {state.socialLinks.map((item, index) => (
          <div key={item.platform} className="grid grid-cols-1 gap-2 items-center md:grid-cols-[180px_1fr_auto]">
            <span className="text-xs uppercase tracking-widest text-neutral-300">
              {socialLabels[item.platform] || item.platform}
            </span>
            <input value={item.url} onChange={(event) => setState((prev) => ({ ...prev, socialLinks: prev.socialLinks.map((current, idx) => (idx === index ? { ...current, url: event.target.value } : current)) }))} className="h-9 px-2 bg-black border border-white/20 text-white text-sm" placeholder="https://..." />
            <label className="flex items-center gap-2 text-xs uppercase text-neutral-300">
              <input type="checkbox" checked={item.enabled} onChange={(event) => setState((prev) => ({ ...prev, socialLinks: prev.socialLinks.map((current, idx) => (idx === index ? { ...current, enabled: event.target.checked } : current)) }))} />
              Enabled
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={async () => {
          const response = await fetch("/api/admin/footer", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(state),
          })
          if (!response.ok) {
            toast.error("Footer save failed")
            return
          }
          toast.success("Footer saved")
        }}
        className="px-3 h-10 bg-primary text-white text-xs uppercase"
      >
        Save footer
      </button>
    </div>
  )
}
