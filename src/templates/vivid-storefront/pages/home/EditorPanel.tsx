"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { EditorProps } from "@/templates/types"
import type { HomeContent } from "./schema"

export function HomeEditorPanel({ content, onSave }: EditorProps<HomeContent>) {
  const [draft, setDraft] = useState<HomeContent>(content)
  const [saving, setSaving] = useState(false)

  const setHero = <K extends keyof HomeContent["hero"]>(
    key: K,
    value: HomeContent["hero"][K]
  ) => setDraft((d) => ({ ...d, hero: { ...d.hero, [key]: value } }))

  const setSpotlight = <K extends keyof HomeContent["spotlight"]>(
    key: K,
    value: HomeContent["spotlight"][K]
  ) =>
    setDraft((d) => ({ ...d, spotlight: { ...d.spotlight, [key]: value } }))

  const setFeaturesTitle = (v: string) =>
    setDraft((d) => ({ ...d, features: { ...d.features, title: v } }))

  const setNewsletter = <K extends keyof HomeContent["newsletter"]>(
    key: K,
    value: HomeContent["newsletter"][K]
  ) =>
    setDraft((d) => ({ ...d, newsletter: { ...d.newsletter, [key]: value } }))

  const updateBadge = (idx: number, value: string) =>
    setHero(
      "badges",
      draft.hero.badges.map((b, i) => (i === idx ? value : b))
    )

  const updateCollection = (
    idx: number,
    key: keyof HomeContent["collections"][number],
    value: string
  ) =>
    setDraft((d) => ({
      ...d,
      collections: d.collections.map((c, i) =>
        i === idx ? { ...c, [key]: value } : c
      ),
    }))

  const addCollection = () =>
    setDraft((d) => ({
      ...d,
      collections: [
        ...d.collections,
        {
          title: "New collection",
          description: "",
          href: "/shop",
          image: "",
          accentColor: "coral",
        },
      ],
    }))

  const removeCollection = (idx: number) =>
    setDraft((d) => ({
      ...d,
      collections: d.collections.filter((_, i) => i !== idx),
    }))

  const updateFeature = (idx: number, key: "title" | "body", value: string) =>
    setDraft((d) => ({
      ...d,
      features: {
        ...d.features,
        items: d.features.items.map((it, i) =>
          i === idx ? { ...it, [key]: value } : it
        ),
      },
    }))

  const addFeature = () =>
    setDraft((d) => ({
      ...d,
      features: {
        ...d.features,
        items: [...d.features.items, { title: "New feature", body: "" }],
      },
    }))

  const removeFeature = (idx: number) =>
    setDraft((d) => ({
      ...d,
      features: {
        ...d.features,
        items: d.features.items.filter((_, i) => i !== idx),
      },
    }))

  const updateTestimonial = (
    idx: number,
    key: "quote" | "name" | "role",
    value: string
  ) =>
    setDraft((d) => ({
      ...d,
      testimonials: {
        ...d.testimonials,
        items: d.testimonials.items.map((t, i) =>
          i === idx ? { ...t, [key]: value } : t
        ),
      },
    }))

  const addTestimonial = () =>
    setDraft((d) => ({
      ...d,
      testimonials: {
        ...d.testimonials,
        items: [
          ...d.testimonials.items,
          { quote: "", name: "", role: "Verified customer" },
        ],
      },
    }))

  const removeTestimonial = (idx: number) =>
    setDraft((d) => ({
      ...d,
      testimonials: {
        ...d.testimonials,
        items: d.testimonials.items.filter((_, i) => i !== idx),
      },
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
    <div className="space-y-12">
      <Section title="Hero">
        <Field label="Eyebrow">
          <Input value={draft.hero.eyebrow} onChange={(e) => setHero("eyebrow", e.target.value)} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Headline">
            <Input
              value={draft.hero.headline}
              onChange={(e) => setHero("headline", e.target.value)}
            />
          </Field>
          <Field label="Headline accent (gradient text)">
            <Input
              value={draft.hero.headlineAccent}
              onChange={(e) => setHero("headlineAccent", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Body">
          <textarea
            className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-24"
            value={draft.hero.body}
            onChange={(e) => setHero("body", e.target.value)}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Primary CTA label">
            <Input
              value={draft.hero.primaryCtaLabel}
              onChange={(e) => setHero("primaryCtaLabel", e.target.value)}
            />
          </Field>
          <Field label="Primary CTA href">
            <Input
              value={draft.hero.primaryCtaHref}
              onChange={(e) => setHero("primaryCtaHref", e.target.value)}
            />
          </Field>
          <Field label="Secondary CTA label">
            <Input
              value={draft.hero.secondaryCtaLabel}
              onChange={(e) => setHero("secondaryCtaLabel", e.target.value)}
            />
          </Field>
          <Field label="Secondary CTA href">
            <Input
              value={draft.hero.secondaryCtaHref}
              onChange={(e) => setHero("secondaryCtaHref", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Hero image URL">
          <Input value={draft.hero.image} onChange={(e) => setHero("image", e.target.value)} />
        </Field>
        <div className="space-y-2">
          <Label>Hero badges</Label>
          {draft.hero.badges.map((badge, idx) => (
            <div key={idx} className="flex gap-2">
              <Input value={badge} onChange={(e) => updateBadge(idx, e.target.value)} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setHero(
                    "badges",
                    draft.hero.badges.filter((_, i) => i !== idx)
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
          {draft.hero.badges.length < 6 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHero("badges", [...draft.hero.badges, "New badge"])}
            >
              Add badge
            </Button>
          ) : null}
        </div>
      </Section>

      <Section
        title="Collections"
        action={
          draft.collections.length < 6 ? (
            <Button size="sm" variant="outline" onClick={addCollection}>
              Add collection
            </Button>
          ) : null
        }
      >
        {draft.collections.map((collection, idx) => (
          <Card key={idx} title={`Collection #${idx + 1}`} onRemove={() => removeCollection(idx)}>
            <Field label="Title">
              <Input
                value={collection.title}
                onChange={(e) => updateCollection(idx, "title", e.target.value)}
              />
            </Field>
            <Field label="Description">
              <Input
                value={collection.description}
                onChange={(e) => updateCollection(idx, "description", e.target.value)}
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Link">
                <Input
                  value={collection.href}
                  onChange={(e) => updateCollection(idx, "href", e.target.value)}
                />
              </Field>
              <Field label="Image URL">
                <Input
                  value={collection.image}
                  onChange={(e) => updateCollection(idx, "image", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Accent color">
              <select
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                value={collection.accentColor}
                onChange={(e) =>
                  updateCollection(
                    idx,
                    "accentColor",
                    e.target.value as HomeContent["collections"][number]["accentColor"]
                  )
                }
              >
                <option value="coral">Coral (primary)</option>
                <option value="navy">Navy (secondary)</option>
                <option value="purple">Purple (accent)</option>
                <option value="cream">Cream (muted)</option>
              </select>
            </Field>
          </Card>
        ))}
      </Section>

      <Section title="Spotlight">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={draft.spotlight.enabled}
            onChange={(e) => setSpotlight("enabled", e.target.checked)}
          />
          <span className="text-sm">Show spotlight section</span>
        </label>
        <Field label="Eyebrow">
          <Input
            value={draft.spotlight.eyebrow}
            onChange={(e) => setSpotlight("eyebrow", e.target.value)}
          />
        </Field>
        <Field label="Title (overridden by product name if a product is selected)">
          <Input
            value={draft.spotlight.title}
            onChange={(e) => setSpotlight("title", e.target.value)}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-24"
            value={draft.spotlight.description}
            onChange={(e) => setSpotlight("description", e.target.value)}
          />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="CTA label">
            <Input
              value={draft.spotlight.ctaLabel}
              onChange={(e) => setSpotlight("ctaLabel", e.target.value)}
            />
          </Field>
          <Field label="CTA href">
            <Input
              value={draft.spotlight.ctaHref}
              onChange={(e) => setSpotlight("ctaHref", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Image URL (fallback)">
            <Input
              value={draft.spotlight.image}
              onChange={(e) => setSpotlight("image", e.target.value)}
            />
          </Field>
          <Field label="Product slug (optional — overrides image and title)">
            <Input
              value={draft.spotlight.productSlug}
              onChange={(e) => setSpotlight("productSlug", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Why-pick-us pillars"
        action={
          draft.features.items.length < 6 ? (
            <Button size="sm" variant="outline" onClick={addFeature}>
              Add pillar
            </Button>
          ) : null
        }
      >
        <Field label="Section title">
          <Input value={draft.features.title} onChange={(e) => setFeaturesTitle(e.target.value)} />
        </Field>
        {draft.features.items.map((item, idx) => (
          <Card key={idx} title={`Pillar #${idx + 1}`} onRemove={() => removeFeature(idx)}>
            <Field label="Title">
              <Input
                value={item.title}
                onChange={(e) => updateFeature(idx, "title", e.target.value)}
              />
            </Field>
            <Field label="Body">
              <textarea
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-20"
                value={item.body}
                onChange={(e) => updateFeature(idx, "body", e.target.value)}
              />
            </Field>
          </Card>
        ))}
      </Section>

      <Section
        title="Testimonials"
        action={
          draft.testimonials.items.length < 8 ? (
            <Button size="sm" variant="outline" onClick={addTestimonial}>
              Add testimonial
            </Button>
          ) : null
        }
      >
        {draft.testimonials.items.map((t, idx) => (
          <Card key={idx} title={`Testimonial #${idx + 1}`} onRemove={() => removeTestimonial(idx)}>
            <Field label="Quote">
              <textarea
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm min-h-20"
                value={t.quote}
                onChange={(e) => updateTestimonial(idx, "quote", e.target.value)}
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Name">
                <Input
                  value={t.name}
                  onChange={(e) => updateTestimonial(idx, "name", e.target.value)}
                />
              </Field>
              <Field label="Role">
                <Input
                  value={t.role}
                  onChange={(e) => updateTestimonial(idx, "role", e.target.value)}
                />
              </Field>
            </div>
          </Card>
        ))}
      </Section>

      <Section title="Newsletter band">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={draft.newsletter.enabled}
            onChange={(e) => setNewsletter("enabled", e.target.checked)}
          />
          <span className="text-sm">Show newsletter band</span>
        </label>
        <Field label="Title">
          <Input
            value={draft.newsletter.title}
            onChange={(e) => setNewsletter("title", e.target.value)}
          />
        </Field>
        <Field label="Body">
          <Input
            value={draft.newsletter.body}
            onChange={(e) => setNewsletter("body", e.target.value)}
          />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Button label">
            <Input
              value={draft.newsletter.buttonLabel}
              onChange={(e) => setNewsletter("buttonLabel", e.target.value)}
            />
          </Field>
          <Field label="Placeholder">
            <Input
              value={draft.newsletter.placeholder}
              onChange={(e) => setNewsletter("placeholder", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="SEO">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="SEO title">
            <Input
              value={draft.meta.seoTitle}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  meta: { ...d.meta, seoTitle: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="SEO description">
            <Input
              value={draft.meta.seoDescription}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  meta: { ...d.meta, seoDescription: e.target.value },
                }))
              }
            />
          </Field>
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function Card({
  title,
  children,
  onRemove,
}: {
  title: string
  children: React.ReactNode
  onRemove: () => void
}) {
  return (
    <div className="space-y-3 rounded-md border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          Remove
        </Button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
