"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { SeoSettings } from "@/services/seo-settings"
import { UploadSheet } from "@/features/site-settings/components/UploadSheet"
import { FallbackImage } from "@/components/common/FallbackImage"

export function SeoEditor({ initial, onSaved }: { initial: SeoSettings; onSaved?: (settings: SeoSettings) => void }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    setState(initial)
  }, [initial])

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-3">
        {Object.entries(state).map(([key, value]) => (
          <label key={key} className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-neutral-400">{key}</span>
            {key === "favicon" ? (
              <div className="space-y-2">
                <FallbackImage src={String(state.favicon || "")} alt="favicon preview" width={40} height={40} className="w-10 h-10 border border-white/20 bg-white" />
                <UploadSheet
                  onUploaded={(url) => setState((prev) => ({ ...prev, favicon: url }))}
                  label="Upload favicon"
                  usageLabel="Favicon (browser tab ikon)"
                  recommendedSize={{ width: 512, height: 512 }}
                  aspect={1}
                />
                <input
                  value={String(value)}
                  onChange={(event) => setState((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm"
                />
                <p className="text-[11px] text-neutral-500">Uses metadata icons in Next.js; static /favicon.ico file is separate.</p>
              </div>
            ) : typeof value === "boolean" ? (
              <input
                type="checkbox"
                checked={value}
                onChange={(event) => setState((prev) => ({ ...prev, [key]: event.target.checked }))}
              />
            ) : (
              <input
                value={String(value)}
                onChange={(event) => setState((prev) => ({ ...prev, [key]: event.target.value }))}
                className="w-full h-9 px-2 bg-black border border-white/20 text-white text-sm"
              />
            )}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={async () => {
          const response = await fetch("/api/admin/seo", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(state),
          })
          if (!response.ok) {
            toast.error("SEO save failed")
            return
          }
          const updated = (await response.json()) as SeoSettings
          setState(updated)
          onSaved?.(updated)
          toast.success("SEO saved")
        }}
        className="px-3 h-10 bg-primary text-white text-xs uppercase"
      >
        Save SEO
      </button>
    </div>
  )
}
