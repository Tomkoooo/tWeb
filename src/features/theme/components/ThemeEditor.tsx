"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ThemeTokens } from "@/services/theme"
import { DEFAULT_THEME_TOKENS } from "@/features/theme/types"

const tokenKeys: Array<keyof ThemeTokens> = [
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "accent",
  "accentForeground",
  "background",
  "foreground",
  "surface",
  "surfaceForeground",
  "border",
  "muted",
  "mutedForeground",
  "success",
  "successForeground",
  "warning",
  "warningForeground",
  "error",
  "errorForeground",
]

export function ThemeEditor({ initial, onSaved }: { initial: ThemeTokens; onSaved?: (theme: ThemeTokens) => void }) {
  const [theme, setTheme] = useState<ThemeTokens>(initial)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")

  useEffect(() => {
    setTheme(initial)
  }, [initial])

  useEffect(() => {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--theme-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`, value)
    })
  }, [theme])

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-3">
        {tokenKeys.map((key) => (
          <label key={key} className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-neutral-400">{key}</span>
            <div className="flex gap-2">
              <input type="color" value={theme[key]} onChange={(event) => setTheme((prev) => ({ ...prev, [key]: event.target.value }))} />
              <input value={theme[key]} onChange={(event) => setTheme((prev) => ({ ...prev, [key]: event.target.value }))} className="flex-1 h-9 px-2 bg-black border border-white/20 text-white text-sm" />
            </div>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(JSON.stringify(theme, null, 2))
            toast.success("Theme JSON copied")
          }}
          className="px-3 h-10 border border-white/20 text-white text-xs uppercase"
        >
          Copy as JSON
        </button>
        <button
          type="button"
          onClick={() => {
            setJsonInput(JSON.stringify(theme, null, 2))
            setJsonOpen(true)
          }}
          className="px-3 h-10 border border-white/20 text-white text-xs uppercase"
        >
          Import from JSON
        </button>
        <button
          type="button"
          onClick={() => setTheme(DEFAULT_THEME_TOKENS)}
          className="px-3 h-10 border border-white/20 text-white text-xs uppercase"
        >
          Reset defaults
        </button>
        <button
          type="button"
          onClick={async () => {
            const res = await fetch("/api/admin/theme", {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(theme),
            })
            if (!res.ok) {
              toast.error("Theme save failed")
              return
            }
            const updated = (await res.json()) as ThemeTokens
            setTheme(updated)
            onSaved?.(updated)
            toast.success("Theme saved")
          }}
          className="px-3 h-10 bg-primary text-white text-xs uppercase"
        >
          Save theme
        </button>
      </div>
      {jsonOpen ? (
        <div className="border border-white/20 bg-black/70 p-3 space-y-2">
          <p className="text-xs text-neutral-400">Paste full JSON object with all theme keys (primary, secondary, accent, background, etc.).</p>
          <textarea
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            rows={10}
            className="w-full bg-black border border-white/20 text-white text-sm p-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonInput) as Partial<ThemeTokens>
                  const next: ThemeTokens = { ...theme }
                  tokenKeys.forEach((key) => {
                    const value = parsed[key]
                    if (typeof value === "string") next[key] = value
                  })
                  setTheme(next)
                  setJsonOpen(false)
                  toast.success("Theme JSON imported")
                } catch {
                  toast.error("Invalid theme JSON")
                }
              }}
              className="px-3 h-9 bg-primary text-white text-xs uppercase"
            >
              Apply JSON
            </button>
            <button type="button" onClick={() => setJsonOpen(false)} className="px-3 h-9 border border-white/20 text-white text-xs uppercase">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
