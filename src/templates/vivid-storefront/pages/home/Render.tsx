import Link from "next/link"
import { ArrowRight, Quote, Sparkles } from "lucide-react"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import { cn } from "@/lib/utils"
import type { RenderProps, HomePageDeps } from "@/templates/types"
import type { HomeContent } from "./schema"
import { HeroBlock } from "./components/HeroBlock"
import { CollectionsBlock } from "./components/CollectionsBlock"
import { NewsletterBlock } from "./components/NewsletterBlock"

const ACCENT_COLORS = {
  coral: "bg-primary text-primary-foreground",
  navy: "bg-secondary text-secondary-foreground",
  purple: "bg-accent text-accent-foreground",
  cream: "bg-muted text-foreground",
} as const

export function HomeRender({
  content,
  deps,
}: RenderProps<HomeContent, HomePageDeps>) {
  const featuredProducts = deps.products.slice(0, 4)
  const spotlightProduct = content.spotlight.productSlug
    ? deps.products.find((p) => p.slug === content.spotlight.productSlug)
    : null

  return (
    <main className="bg-background text-foreground">
      <HeroBlock content={content.hero} />

      <CollectionsBlock collections={content.collections} accentClasses={ACCENT_COLORS} />

      {featuredProducts.length > 0 ? (
        <section className="border-b border-border bg-muted/40">
          <div className="container mx-auto px-4 py-20">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                  Stocked now
                </p>
                <h2 className="mt-2 font-serif text-4xl font-black tracking-tight md:text-5xl">
                  Fresh in the catalog
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground hover:text-primary md:inline-flex"
              >
                See everything
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block overflow-hidden rounded-3xl bg-surface ring-1 ring-border transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <FallbackImage
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mutedForeground">
                      {product.category}
                    </p>
                    <p className="font-serif text-lg font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {new Intl.NumberFormat("hu-HU", {
                        style: "currency",
                        currency: "HUF",
                        maximumFractionDigits: 0,
                      }).format(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {content.spotlight.enabled ? (
        <section className="border-b border-border">
          <div className="container mx-auto grid gap-12 px-4 py-24 md:grid-cols-2 md:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted ring-1 ring-border">
              {(spotlightProduct?.image || content.spotlight.image) ? (
                <FallbackImage
                  src={mediaImageSrc(spotlightProduct?.image || content.spotlight.image)}
                  alt={content.spotlight.title}
                  fill
                  className="object-cover"
                />
              ) : null}
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground">
                <Sparkles className="h-3 w-3" />
                Spotlight
              </div>
            </div>
            <div className="space-y-6">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                {content.spotlight.eyebrow}
              </p>
              <h2 className="font-serif text-4xl font-black tracking-tight md:text-6xl">
                {spotlightProduct?.name || content.spotlight.title}
              </h2>
              <p className="text-lg leading-relaxed text-mutedForeground">
                {content.spotlight.description}
              </p>
              <Link
                href={
                  spotlightProduct
                    ? `/products/${spotlightProduct.slug}`
                    : content.spotlight.ctaHref
                }
                className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-secondary"
              >
                {content.spotlight.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {content.features.items.length > 0 ? (
        <section className="border-b border-border bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 py-24">
            <h2 className="mb-16 max-w-2xl font-serif text-4xl font-black tracking-tight md:text-5xl">
              {content.features.title}
            </h2>
            <div className="grid gap-10 md:grid-cols-3">
              {content.features.items.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
                >
                  <p className="font-mono text-5xl font-black text-accent">
                    0{idx + 1}
                  </p>
                  <p className="mt-4 font-serif text-2xl font-bold">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {content.testimonials.items.length > 0 ? (
        <section className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-24">
            <h2 className="mb-12 font-serif text-4xl font-black tracking-tight md:text-5xl">
              {content.testimonials.title}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {content.testimonials.items.map((t, idx) => (
                <figure
                  key={idx}
                  className={cn(
                    "rounded-3xl p-8 ring-1 ring-border",
                    idx % 2 === 0 ? "bg-muted" : "bg-surface"
                  )}
                >
                  <Quote className="h-8 w-8 text-accent" aria-hidden />
                  <blockquote className="mt-4 font-serif text-xl leading-snug text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6">
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    {t.role ? (
                      <p className="text-xs uppercase tracking-widest text-mutedForeground">
                        {t.role}
                      </p>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {content.newsletter.enabled ? (
        <NewsletterBlock content={content.newsletter} />
      ) : null}
    </main>
  )
}
