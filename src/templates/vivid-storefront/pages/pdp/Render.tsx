import Link from "next/link"
import { ChevronRight, ShieldCheck, Truck, RotateCcw } from "lucide-react"
import { ProductDetail } from "@/app/products/[slug]/ProductDetail"
import type { RenderProps, PdpPageDeps } from "@/templates/types"
import type { PdpContent } from "./schema"

const ICONS = {
  shield: ShieldCheck,
  truck: Truck,
  rotate: RotateCcw,
} as const

type ProductLite = {
  name?: string
  category?: { name?: string; slug?: string } | null
}

export function PdpRender({
  content,
  deps,
}: RenderProps<PdpContent, PdpPageDeps>) {
  const product = deps.product as ProductLite
  return (
    <main className="bg-background text-foreground">
      {content.showBreadcrumb ? (
        <div className="border-b border-border bg-muted/40">
          <div className="container mx-auto flex flex-wrap items-center gap-2 px-4 py-4 text-xs font-bold uppercase tracking-wider text-mutedForeground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/shop" className="hover:text-foreground">
              Shop
            </Link>
            {product?.category?.name && product.category.slug ? (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hover:text-foreground"
                >
                  {product.category.name}
                </Link>
              </>
            ) : null}
            {product?.name ? (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{product.name}</span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <ProductDetail
        product={deps.product as never}
        initialVariantId={deps.selectedVariantId}
      />

      {content.showTrustStrip && content.trustItems.length > 0 ? (
        <section className="border-t border-border bg-muted/40">
          <div className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-3">
            {content.trustItems.map((item, idx) => {
              const Icon = ICONS[item.icon]
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-6"
                >
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-serif text-base font-bold text-foreground">
                    {item.label}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </main>
  )
}
