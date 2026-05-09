import Link from "next/link"
import type { RenderProps, ShopPageDeps } from "@/templates/types"
import type { ShopContent } from "./schema"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import { cn } from "@/lib/utils"

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
    <main className="bg-background pb-24 pt-12 text-foreground">
      <div className="container mx-auto px-4">
        <div className="mb-12 max-w-3xl">
          <h1 className="font-serif text-4xl font-semibold tracking-tight md:text-5xl">
            {content.heading}
          </h1>
          {content.subheading ? (
            <p className="mt-3 text-muted-foreground">{content.subheading}</p>
          ) : null}
          <p className="mt-6 text-sm text-muted-foreground">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-16 text-center">
            <p className="text-muted-foreground">{content.emptyStateMessage}</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-foreground px-6 py-2 text-sm font-semibold text-foreground hover:bg-foreground hover:text-background"
            >
              Show all products
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
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                      <FallbackImage
                        src={mediaImageSrc(product.images?.[0])}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-3 font-serif text-base font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat("hu-HU", {
                        style: "currency",
                        currency: "HUF",
                        maximumFractionDigits: 0,
                      }).format(final)}
                    </p>
                  </Link>
                )
              })}
            </div>

            {pages > 1 ? (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildPageHref(p)}
                    className={cn(
                      "h-10 w-10 rounded-full border text-sm font-medium flex items-center justify-center transition",
                      p === currentPage
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    )}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}
