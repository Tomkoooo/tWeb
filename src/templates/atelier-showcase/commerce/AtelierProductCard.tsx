"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import { getActiveVariants, hasVariants } from "@/lib/product-variants"
import { formatHuf, grossFromNetWithDiscount, netToGross, priceBreakdownFromGross, clampVatPercent } from "@/lib/pricing"
import { useCartStore } from "@/store/useCartStore"

/**
 * Catalogue **row card** (image + copy side-by-side) — unlike engine `ProductCard` portrait glass tile.
 */
export function AtelierProductCard({ product }: { product: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [shopEnabled, setShopEnabled] = React.useState<boolean | null>(null)
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const variantProduct = hasVariants(p)
  const requiresVariantSelection = Boolean(p.requireVariantSelection) && variantProduct
  const activeVariants = getActiveVariants(p)
  const minNetPrice =
    requiresVariantSelection && activeVariants.length > 0
      ? Math.min(
          ...activeVariants.map((v: { netPrice?: number; discount?: number }) => v.netPrice || p.netPrice)
        )
      : p.netPrice
  const maxDiscount =
    requiresVariantSelection && activeVariants.length > 0
      ? Math.max(...activeVariants.map((v: { netPrice?: number; discount?: number }) => v.discount || 0))
      : p.discount || 0

  const vatPct = clampVatPercent(p.vatPercent)
  const finalPrice = grossFromNetWithDiscount(minNetPrice, maxDiscount, vatPct)
  const breakdown = priceBreakdownFromGross(finalPrice, 1, vatPct)
  const ratingValue = typeof p.rating === "number" ? p.rating : 0

  React.useEffect(() => {
    const loadAvailability = async () => {
      try {
        const res = await fetch("/api/shop/availability")
        if (!res.ok) {
          setShopEnabled(false)
          return
        }
        const data = await res.json()
        setShopEnabled(Boolean(data.enabled))
      } catch {
        setShopEnabled(false)
      }
    }
    void loadAvailability()
  }, [])

  const handleAddToCart = () => {
    if (shopEnabled === false) return
    if (requiresVariantSelection) {
      router.push(`/products/${p.slug}`)
      return
    }
    addItem({
      id: p._id.toString(),
      productId: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: finalPrice,
      image: mediaImageSrc(p.images?.[0]),
      quantity: 1,
      stock: p.stock,
      netPrice: p.netPrice,
      discount: p.discount,
      vatPercent: vatPct,
    })
  }

  return (
    <article className="group flex flex-col gap-4 border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-stretch">
      <Link
        href={`/products/${p.slug}`}
        className="relative block h-44 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-40 sm:min-w-[10rem]"
      >
        {!isLoaded && <Skeleton className="absolute inset-0 z-10 rounded-none" />}
        <FallbackImage
          src={mediaImageSrc(p.images?.[0])}
          alt={p.name}
          fill
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "object-cover transition duration-500 group-hover:scale-[1.02]",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
        <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-wrap gap-1 drop-shadow-sm">
          <Badge className="rounded-full border border-primary-foreground/30 bg-primary px-2 py-0 font-serif text-[9px] uppercase tracking-widest text-primary-foreground">
            {p.category?.name || "Termék"}
          </Badge>
          {maxDiscount > 0 ? (
            <Badge className="rounded-full border border-border bg-card px-2 py-0 font-serif text-[9px] text-foreground">
              −{maxDiscount}%
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/products/${p.slug}`} className="block min-w-0">
              <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight text-foreground decoration-primary/0 underline-offset-4 group-hover:underline">
                {p.name}
              </h3>
            </Link>
            <span className="font-serif text-[10px] text-muted-foreground">★ {ratingValue.toFixed(1)}</span>
            {requiresVariantSelection ? (
              <Badge variant="outline" className="rounded-full font-serif text-[9px] uppercase">
                Variáns
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 font-serif text-[10px] uppercase tracking-widest text-muted-foreground">
            Nettó {formatHuf(breakdown.unitNet)} · ÁFA {breakdown.vatPercent}%
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-xl font-semibold text-foreground">
              {formatHuf(finalPrice)}
              {requiresVariantSelection ? (
                <span className="ml-1 text-xs font-normal text-muted-foreground">tól</span>
              ) : null}
            </p>
            {maxDiscount > 0 ? (
              <p className="font-serif text-sm text-muted-foreground line-through">{formatHuf(netToGross(minNetPrice))}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddToCart}
              disabled={shopEnabled === false}
              className="rounded-full border-0 bg-primary font-serif text-xs uppercase tracking-wider text-primary-foreground"
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              {requiresVariantSelection ? "PDP" : "Kosárba"}
            </Button>
            <Button variant="outline" size="sm" asChild className="rounded-full border-border font-serif text-xs uppercase">
              <Link href={`/products/${p.slug}`}>Részletek</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
