"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { EditorProps } from "@/templates/types"
import type { AboutContent } from "./schema"

export function AboutEditorPanel({ content, onSave }: EditorProps<AboutContent>) {
  const [draft, setDraft] = useState<AboutContent>(content)
  const [saving, setSaving] = useState(false)

  const setHero = <K extends keyof AboutContent["hero"]>(
    key: K,
    value: AboutContent["hero"][K]
  ) => setDraft((d) => ({ ...d, hero: { ...d.hero, [key]: value } }))

  const setCta = <K extends keyof AboutContent["cta"]>(
    key: K,
    value: AboutContent["cta"][K]
  ) => setDraft((d) => ({ ...d, cta: { ...d.cta, [key]: value } }))

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(draft)
      toast.success("About page saved")
    } catch (error) {
      console.error(error)
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Hero</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input value={draft.hero.eyebrow} onChange={(e) => setHero("eyebrow", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={draft.hero.title} onChange={(e) => setHero("title", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <textarea
            className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-24"
            value={draft.hero.body}
            onChange={(e) => setHero("body", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Hero image URL</Label>
          <Input value={draft.hero.image} onChange={(e) => setHero("image", e.target.value)} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">CTA band</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input value={draft.cta.eyebrow} onChange={(e) => setCta("eyebrow", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={draft.cta.title} onChange={(e) => setCta("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button label</Label>
            <Input value={draft.cta.label} onChange={(e) => setCta("label", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button href</Label>
            <Input value={draft.cta.href} onChange={(e) => setCta("href", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">SEO</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>SEO title</Label>
            <Input
              value={draft.meta.seoTitle}
              onChange={(e) =>
                setDraft((d) => ({ ...d, meta: { ...d.meta, seoTitle: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>SEO description</Label>
            <Input
              value={draft.meta.seoDescription}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  meta: { ...d.meta, seoDescription: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </section>

      <p className="rounded-md border border-white/10 bg-muted/40 p-4 text-sm text-muted-foreground">
        For pillars, story sections, and team members, edit{" "}
        <code className="font-mono text-xs">
          src/templates/vivid-storefront/static-pages/about/defaultContent.ts
        </code>{" "}
        — they are part of the template definition (Git-only) and will reset
        when you save here.
      </p>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
