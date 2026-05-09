"use client"

import { useState } from "react"
import type { EditorProps } from "@/templates/types"
import type { HomeContent } from "./schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function HomeEditorPanel({ content, onSave }: EditorProps<HomeContent>) {
  const [draft, setDraft] = useState<HomeContent>(content)
  const [saving, setSaving] = useState(false)

  const updateHero = <K extends keyof HomeContent["hero"]>(
    key: K,
    value: HomeContent["hero"][K]
  ) =>
    setDraft((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }))

  const updateFeatured = <K extends keyof HomeContent["featured"]>(
    key: K,
    value: HomeContent["featured"][K]
  ) =>
    setDraft((prev) => ({ ...prev, featured: { ...prev.featured, [key]: value } }))

  const updateClosing = <K extends keyof HomeContent["closing"]>(
    key: K,
    value: HomeContent["closing"][K]
  ) =>
    setDraft((prev) => ({ ...prev, closing: { ...prev.closing, [key]: value } }))

  const updatePillar = (
    index: number,
    key: "title" | "body",
    value: string
  ) =>
    setDraft((prev) => ({
      ...prev,
      pillars: prev.pillars.map((p, i) =>
        i === index ? { ...p, [key]: value } : p
      ),
    }))

  const addPillar = () =>
    setDraft((prev) => ({
      ...prev,
      pillars: [...prev.pillars, { title: "New pillar", body: "" }],
    }))

  const removePillar = (index: number) =>
    setDraft((prev) => ({
      ...prev,
      pillars: prev.pillars.filter((_, i) => i !== index),
    }))

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(draft)
      toast.success("Homepage saved")
    } catch (error) {
      console.error(error)
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Hero</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input
              value={draft.hero.eyebrow}
              onChange={(e) => updateHero("eyebrow", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Hero image URL</Label>
            <Input
              value={draft.hero.image}
              onChange={(e) => updateHero("image", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Headline</Label>
          <Input
            value={draft.hero.headline}
            onChange={(e) => updateHero("headline", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <textarea
            className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-24"
            value={draft.hero.body}
            onChange={(e) => updateHero("body", e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>CTA label</Label>
            <Input
              value={draft.hero.ctaLabel}
              onChange={(e) => updateHero("ctaLabel", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>CTA href</Label>
            <Input
              value={draft.hero.ctaHref}
              onChange={(e) => updateHero("ctaHref", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pillars</h3>
          <Button size="sm" variant="outline" onClick={addPillar}>
            Add pillar
          </Button>
        </div>
        <div className="space-y-4">
          {draft.pillars.map((pillar, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-white/10 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pillar #{index + 1}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePillar(index)}
                >
                  Remove
                </Button>
              </div>
              <Input
                value={pillar.title}
                onChange={(e) => updatePillar(index, "title", e.target.value)}
                placeholder="Title"
              />
              <textarea
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-20"
                value={pillar.body}
                onChange={(e) => updatePillar(index, "body", e.target.value)}
                placeholder="Body"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Featured products</h3>
        <div className="space-y-2">
          <Label>Headline</Label>
          <Input
            value={draft.featured.headline}
            onChange={(e) => updateFeatured("headline", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={draft.featured.description}
            onChange={(e) => updateFeatured("description", e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.featured.showProductGrid}
              onChange={(e) => updateFeatured("showProductGrid", e.target.checked)}
            />
            <span className="text-sm">Show product grid</span>
          </label>
          <div className="space-y-2">
            <Label>Product limit</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={draft.featured.productLimit}
              onChange={(e) => updateFeatured("productLimit", Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Closing</h3>
        <div className="space-y-2">
          <Label>Headline</Label>
          <Input
            value={draft.closing.headline}
            onChange={(e) => updateClosing("headline", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <textarea
            className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-20"
            value={draft.closing.body}
            onChange={(e) => updateClosing("body", e.target.value)}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
