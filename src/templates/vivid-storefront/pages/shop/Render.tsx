import Link from "next/link"
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import { cn } from "@/lib/utils"
import type { RenderProps, ShopPageDeps } from "@/templates/types"
import type { ShopContent } from "./schema"

const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}

type ProductDoc = {
  _id: { toString(): string }
  name: string
  slug: string
  netPrice?: number
  discount?: number
  images?: string[]
}

export function ShopRender({
  content,
  deps,
}: RenderProps<ShopContent, ShopPageDeps>) {
  const { products, total, pages, currentPage, query } = deps
  const list = products as ProductDoc[]

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams()
    if (query.q) params.set("q", query.q)
    if (query.category) params.set("category", query.category)
    if (query.discounted) params.set("discounted", "true")
    if (query.sort) params.set("sort", query.sort)
    params.set("page", String(page))
    return `/shop?${params.toString()}`
  }

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <section className="border-b border-border bg-muted/40">
        <div className="container mx-auto px-4 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            {content.eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h1 className="font-serif text-5xl font-black tracking-tight md:text-6xl">
              {content.heading}
            </h1>
            <span className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold uppercase tracking-widest text-mutedForeground">
              {total} {total === 1 ? "item" : "items"}
            </span>
          </div>
          {content.subheading ? (
            <p className="mt-4 max-w-2xl text-base text-mutedForeground">
              {content.subheading}
            </p>
          ) : null}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition hover:bg-muted"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <p className="text-xs uppercase tracking-widest text-mutedForeground">
            Showing page {currentPage} of {pages || 1}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-20 text-center">
            <p className="font-serif text-xl font-bold text-foreground">
              {content.emptyStateMessage}
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-secondary"
            >
              Reset filters
            </Link>
          </div>
        ) : (
          <>
            <div className={cn("grid gap-6", COLUMN_CLASSES[content.productGridColumns])}>
              {list.map((product) => {
                const gross = (product.netPrice ?? 0) * 1.27
                const final = gross * (1 - (product.discount ?? 0) / 100)
                return (
                  <Link
                    key={product._id.toString()}
                    href={`/products/${product.slug}`}
                    className="group block overflow-hidden rounded-3xl bg-surface ring-1 ring-border transition hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <FallbackImage
                        src={mediaImageSrc(product.images?.[0])}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-110"
                      />
                      {product.discount && product.discount > 0 ? (
                        <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent-foreground">
                          -{product.discount}%
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-2 p-5">
                      <p className="font-serif text-lg font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {new Intl.NumberFormat("hu-HU", {
                          style: "currency",
                          currency: "HUF",
                          maximumFractionDigits: 0,
                        }).format(final)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {pages > 1 ? (
              <div className="mt-12 flex items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildPageHref(currentPage - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : null}
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildPageHref(p)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition",
                      p === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface text-foreground hover:bg-muted"
                    )}
                  >
                    {p}
                  </Link>
                ))}
                {currentPage < pages ? (
                  <Link
                    href={buildPageHref(currentPage + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-muted"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  )
}
