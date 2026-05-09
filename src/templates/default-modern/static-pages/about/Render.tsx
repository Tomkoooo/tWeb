import Link from "next/link"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import type { RenderProps, StaticPageDeps } from "@/templates/types"
import type { AboutContent } from "./schema"

export function AboutRender({ content }: RenderProps<AboutContent, StaticPageDeps>) {
  return (
    <main className="bg-background-dark text-white">
      <section className="border-b border-white/10 pt-32 pb-20">
        <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
              {content.hero.title}
            </h1>
            {content.hero.subtitle ? (
              <p className="max-w-xl text-lg text-neutral-300">{content.hero.subtitle}</p>
            ) : null}
          </div>
          {content.hero.image ? (
            <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-black/30">
              <FallbackImage
                src={content.hero.image}
                alt={content.hero.title}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {content.story.paragraphs.length > 0 ? (
        <section className="border-b border-white/10 py-20">
          <div className="container mx-auto max-w-3xl space-y-6 px-4">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {content.story.heading}
            </h2>
            {content.story.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-neutral-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {content.highlights.length > 0 ? (
        <section className="border-b border-white/10 py-20">
          <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
            {content.highlights.map((h, idx) => (
              <div key={idx} className="space-y-3 border border-white/10 bg-white/5 p-6">
                <p className="font-mono text-xs text-primary">0{idx + 1}</p>
                <p className="text-lg font-black uppercase tracking-tight">{h.title}</p>
                <p className="text-sm text-neutral-400">{h.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content.team.length > 0 ? (
        <section className="border-b border-white/10 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-3xl font-black uppercase tracking-tight">A csapat</h2>
            <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
              {content.team.map((member, idx) => (
                <div key={idx} className="space-y-3">
                  {member.photo ? (
                    <div className="relative aspect-square overflow-hidden border border-white/10 bg-black/30">
                      <FallbackImage
                        src={mediaImageSrc(member.photo)}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="text-sm font-black uppercase tracking-widest">{member.name}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {content.cta.label ? (
        <section className="py-20 text-center">
          <Link
            href={content.cta.href}
            className="inline-flex items-center justify-center bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white"
          >
            {content.cta.label}
          </Link>
        </section>
      ) : null}
    </main>
  )
}
