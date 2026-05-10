"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { THEME_TOKEN_KEYS } from "@/lib/theme-token-keys"
import type { ThemeTokens } from "@/services/theme"

type Props = {
  initial: ThemeTokens
  /** Baseline palette after clearing overrides (template.defaultTheme ?? engine defaults). */
  resetBaseline: ThemeTokens
  resetHelpText?: string
  onSaved?: (theme: ThemeTokens) => void
}

export function ThemeEditor({
  initial,
  resetBaseline,
  resetHelpText,
  onSaved,
}: Props) {
  const router = useRouter()
  const [theme, setTheme] = useState<ThemeTokens>(initial)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")

  useEffect(() => {
    setTheme(initial)
  }, [initial])

  useEffect(() => {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--theme-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`,
        value
      )
    })
  }, [theme])

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-3">
        {THEME_TOKEN_KEYS.map((key) => (
          <label key={key} className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-neutral-400">{key}</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme[key as keyof ThemeTokens]}
                onChange={(event) =>
                  setTheme((prev) => ({ ...prev, [key]: event.target.value }))
                }
              />
              <input
                value={theme[key as keyof ThemeTokens]}
                onChange={(event) =>
                  setTheme((prev) => ({ ...prev, [key]: event.target.value }))
                }
                className="flex-1 h-9 px-2 bg-black border border-white/20 text-white text-sm"
              />
            </div>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
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
          onClick={() => setTheme(resetBaseline)}
          className="px-3 h-10 border border-white/20 text-white text-xs uppercase"
          title={resetHelpText}
        >
          Preview baseline
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              const res = await fetch("/api/admin/theme", { method: "DELETE" })
              if (!res.ok) {
                toast.error("Could not reset theme on server")
                return
              }
              const merged = (await res.json()) as ThemeTokens
              setTheme(merged)
              onSaved?.(merged)
              router.refresh()
              toast.success("Saved: theme reset to baseline (overrides cleared)")
            } catch {
              toast.error("Could not reset theme on server")
            }
          }}
          className="px-3 h-10 border border-amber-500/40 text-amber-100 text-xs uppercase"
          title="Writes to disk: storefront uses template or engine baseline until you customise again"
        >
          Reset to default & save
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
            router.refresh()
            toast.success("Theme saved")
          }}
          className="px-3 h-10 bg-primary text-white text-xs uppercase"
        >
          Save theme
        </button>
      </div>
      {resetHelpText ? <p className="text-[11px] text-neutral-500 max-w-xl">{resetHelpText}</p> : null}
      {jsonOpen ? (
        <div className="border border-white/20 bg-black/70 p-3 space-y-2">
          <p className="text-xs text-neutral-400">
            Paste full JSON object with all theme keys (primary, secondary, accent, background, etc.).
          </p>
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
                  THEME_TOKEN_KEYS.forEach((key) => {
                    const value = parsed[key as keyof ThemeTokens]
                    if (typeof value === "string") next[key as keyof ThemeTokens] = value
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
            <button
              type="button"
              onClick={() => setJsonOpen(false)}
              className="px-3 h-9 border border-white/20 text-white text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
