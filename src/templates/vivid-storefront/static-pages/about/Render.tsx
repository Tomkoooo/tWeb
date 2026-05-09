import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FallbackImage } from "@/components/common/FallbackImage"
import type { RenderProps, StaticPageDeps } from "@/templates/types"
import type { AboutContent } from "./schema"

export function AboutRender({
  content,
}: RenderProps<AboutContent, StaticPageDeps>) {
  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="container mx-auto grid gap-12 px-4 py-24 md:grid-cols-[1.2fr,1fr] md:items-center">
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
              {content.hero.eyebrow}
            </p>
            <h1 className="font-serif text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              {content.hero.title}
            </h1>
            {content.hero.body ? (
              <p className="max-w-xl text-lg leading-relaxed text-mutedForeground">
                {content.hero.body}
              </p>
            ) : null}
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-muted ring-1 ring-border md:max-w-md md:justify-self-end">
            {content.hero.image ? (
              <FallbackImage
                src={content.hero.image}
                alt={content.hero.title}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
        </div>
      </section>

      {content.pillars.length > 0 ? (
        <section className="border-b border-border bg-secondary text-secondary-foreground">
          <div className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-3">
            {content.pillars.map((pillar) => (
              <div key={pillar.number} className="space-y-3">
                <p className="font-mono text-5xl font-black text-accent">{pillar.number}</p>
                <p className="font-serif text-2xl font-bold">{pillar.title}</p>
                <p className="text-sm leading-relaxed text-white/70">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content.storySections.length > 0 ? (
        <section className="border-b border-border">
          <div className="container mx-auto space-y-20 px-4 py-24">
            {content.storySections.map((s, idx) => (
              <div
                key={idx}
                className={`grid gap-10 md:grid-cols-2 md:items-center ${
                  idx % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="space-y-4">
                  <h2 className="font-serif text-4xl font-black tracking-tight md:text-5xl">
                    {s.heading}
                  </h2>
                  <p className="text-base leading-relaxed text-mutedForeground">{s.body}</p>
                </div>
                {s.image ? (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted ring-1 ring-border">
                    <FallbackImage src={s.image} alt={s.heading} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[4/5] rounded-[2.5rem] bg-gradient-to-br from-muted via-primary/10 to-accent/10 ring-1 ring-border" />
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content.team.length > 0 ? (
        <section className="border-b border-border bg-muted/40">
          <div className="container mx-auto px-4 py-20">
            <h2 className="mb-10 font-serif text-4xl font-black tracking-tight md:text-5xl">
              The people
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {content.team.map((person) => (
                <div
                  key={person.name}
                  className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border"
                >
                  <div className="relative aspect-square bg-muted">
                    {person.photo ? (
                      <FallbackImage
                        src={person.photo}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-serif text-6xl font-black text-mutedForeground">
                        {person.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-6">
                    <p className="font-serif text-xl font-bold">{person.name}</p>
                    <p className="text-xs uppercase tracking-widest text-accent">
                      {person.role}
                    </p>
                    {person.bio ? (
                      <p className="pt-2 text-sm text-mutedForeground">{person.bio}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-start gap-6 px-4 py-20 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/70">
              {content.cta.eyebrow}
            </p>
            {content.cta.title ? (
              <p className="max-w-2xl font-serif text-3xl font-black md:text-4xl">
                {content.cta.title}
              </p>
            ) : null}
          </div>
          <Link
            href={content.cta.href}
            className="inline-flex items-center gap-3 rounded-full bg-secondary px-8 py-4 text-sm font-bold uppercase tracking-wider text-secondary-foreground transition hover:bg-secondary/80"
          >
            {content.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
