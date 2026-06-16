"use client"

import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import { EditableDocText } from "@/features/template-cms/primitives/EditableDocText"
import { useSurfaceDocEdit } from "@/features/template-cms/surface-doc-edit-context"
import type { RenderProps, StaticPageDeps } from "@/templates/types"
import type { SakkmedPageContent } from "./schema"

export function SakkmedPageRender({ content }: RenderProps<SakkmedPageContent, StaticPageDeps>) {
  const cms = useSurfaceDocEdit()

  return (
    <main className="bg-background text-foreground pt-28">
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Szolgáltatás</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              <EditableDocText path="hero.title" value={content.hero.title} />
            </h1>
            {(content.hero.subtitle || cms.enabled) && (
              <p className="text-lg text-muted-foreground">
                <EditableDocText path="hero.subtitle" value={content.hero.subtitle} multiline />
              </p>
            )}
            {(content.contactEmail || cms.enabled) && (
              <div className="rounded-lg border border-border/60 bg-surface/40 p-4 text-sm">
                <p className="font-semibold text-foreground">
                  <EditableDocText path="contactLabel" value={content.contactLabel} />
                </p>
                <p className="mt-1 text-accent">
                  <EditableDocText path="contactEmail" value={content.contactEmail} />
                </p>
              </div>
            )}
          </div>
          {content.hero.image ? (
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
              <FallbackImage
                src={mediaImageSrc(content.hero.image)}
                alt={content.hero.title}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {(content.sections.length > 0 || cms.enabled) && (
        <section className="border-b border-border/60 py-16">
          <div className="mx-auto max-w-4xl space-y-10 px-4">
            {(cms.enabled ? [0, 1, 2, 3, 4] : content.sections.map((_, idx) => idx)).map((idx) => {
              const section = content.sections[idx] ?? { heading: "", body: "", image: "" }
              if (!cms.enabled && !section.body.trim() && !section.heading.trim()) return null
              return (
                <article key={idx} className="grid gap-6 md:grid-cols-[1fr_180px] md:items-start">
                  <div className="space-y-3">
                    {(section.heading || cms.enabled) && (
                      <h2 className="text-2xl font-semibold">
                        <EditableDocText path={`sections.${idx}.heading`} value={section.heading} />
                      </h2>
                    )}
                    <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      <EditableDocText path={`sections.${idx}.body`} value={section.body} multiline />
                    </div>
                  </div>
                  {section.image ? (
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-border/60">
                      <FallbackImage
                        src={mediaImageSrc(section.image)}
                        alt={section.heading || content.hero.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {(content.gallery.length > 0 || cms.enabled) && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(cms.enabled ? [0, 1, 2, 3, 4, 5] : content.gallery.map((_, idx) => idx)).map((idx) => {
                const item = content.gallery[idx] ?? { image: "", caption: "" }
                if (!cms.enabled && !item.image) return null
                return (
                  <figure
                    key={idx}
                    className="overflow-hidden rounded-xl border border-border/60 bg-surface/30"
                  >
                    {item.image ? (
                      <div className="relative aspect-[4/3]">
                        <FallbackImage
                          src={mediaImageSrc(item.image)}
                          alt={item.caption || content.hero.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    {(item.caption || cms.enabled) && (
                      <figcaption className="px-3 py-2 text-sm text-muted-foreground">
                        <EditableDocText path={`gallery.${idx}.caption`} value={item.caption} />
                      </figcaption>
                    )}
                  </figure>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
