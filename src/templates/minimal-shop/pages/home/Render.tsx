import Link from "next/link"
import type { RenderProps, HomePageDeps } from "@/templates/types"
import type { HomeContent } from "./schema"
import { FallbackImage } from "@/components/common/FallbackImage"

export function HomeRender({
  content,
  deps,
}: RenderProps<HomeContent, HomePageDeps>) {
  const featuredProducts = content.featured.showProductGrid
    ? deps.products.slice(0, content.featured.productLimit)
    : []

  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="container mx-auto grid gap-16 px-4 py-24 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            {content.hero.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                {content.hero.eyebrow}
              </p>
            ) : null}
            <h1 className="font-serif text-4xl font-semibold tracking-tight md:text-6xl">
              {content.hero.headline}
            </h1>
            {content.hero.body ? (
              <p className="max-w-lg text-lg text-muted-foreground">{content.hero.body}</p>
            ) : null}
            {content.hero.ctaLabel ? (
              <Link
                href={content.hero.ctaHref}
                className="inline-flex items-center justify-center rounded-full border border-foreground bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-background hover:text-foreground"
              >
                {content.hero.ctaLabel}
              </Link>
            ) : null}
          </div>
          {content.hero.image ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
              <FallbackImage
                src={content.hero.image}
                alt={content.hero.headline}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {content.pillars.length > 0 ? (
        <section className="border-b border-border">
          <div className="container mx-auto grid gap-8 px-4 py-20 md:grid-cols-3">
            {content.pillars.map((pillar, index) => (
              <div key={`${pillar.title}-${index}`} className="space-y-3">
                <p className="font-mono text-xs text-accent">0{index + 1}</p>
                <p className="font-serif text-xl font-semibold">{pillar.title}</p>
                <p className="text-sm text-muted-foreground">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {featuredProducts.length > 0 ? (
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-20">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
                  {content.featured.headline}
                </h2>
                {content.featured.description ? (
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    {content.featured.description}
                  </p>
                ) : null}
              </div>
              <Link
                href="/shop"
                className="hidden text-sm font-semibold uppercase tracking-wider text-accent hover:underline md:inline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                    <FallbackImage
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 font-serif text-base font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat("hu-HU", {
                      style: "currency",
                      currency: "HUF",
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {content.closing.headline ? (
        <section>
          <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              {content.closing.headline}
            </h2>
            {content.closing.body ? (
              <p className="mt-4 text-muted-foreground">{content.closing.body}</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  )
}
