"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCartStore, type CartItem } from "@/store/useCartStore"
import { formatHuf, priceBreakdownFromGross, totalsBreakdownFromGross } from "@/lib/pricing"
import { FallbackImage } from "@/components/common/FallbackImage"
import type { FlowRouteMainProps } from "@/templates/types"
import { useCheckoutWithSuggestions } from "@/components/checkout-suggestions/CheckoutSuggestionsDialog"

const ITEMS_PER_PAGE = 5

/**
 * Cart: **full-bleed alternating rows** + **floating checkout bar** on small screens — unlike
 * default `CartPageView` grid + glass summary card pattern.
 */
export function AtelierCartPageBody({ shopEnabled, variant = "page" }: FlowRouteMainProps) {
  const embedded = variant === "embedded"
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore()
  const { beginCheckout, checkoutModalUI, checkoutSuggestionsLoading } = useCheckoutWithSuggestions()
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const totalBreakdown = totalsBreakdownFromGross(totalPrice)

  const shell = embedded
    ? "min-h-0 bg-transparent py-2 pb-6 px-2 sm:px-3"
    : "min-h-screen bg-gradient-to-b from-background via-muted/20 to-background pb-32 pt-36 md:pb-24 md:pt-40"

  if (shopEnabled === false) {
    return (
      <main className={shell}>
        <div className="mx-auto max-w-xl px-4">
          <div className="rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-lg">
            <p className="font-serif text-2xl font-semibold text-foreground">A rendelés szünetel</p>
            <p className="mt-4 font-serif text-muted-foreground">
              Jelenleg nem lehet kosarat leadni. Látogass vissza később, vagy írj nekünk.
            </p>
            <Button asChild className="mt-8 rounded-full border-2 border-primary font-serif uppercase tracking-widest">
              <Link href="/">Vissza a főoldalra</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className={shell}>
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
          <div className="mb-8 h-32 w-32 rounded-full border-2 border-dashed border-muted-foreground/40" aria-hidden />
          <p className="font-serif text-3xl font-semibold text-foreground">A kosarad üres</p>
          <p className="mt-4 font-serif text-muted-foreground">Válassz termékeket a katalógusból.</p>
          <Button asChild className="mt-10 rounded-full border-2 border-foreground bg-transparent px-10 font-serif uppercase tracking-[0.2em] hover:bg-foreground hover:text-background">
            <Link href="/shop">Irány a bolt</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className={shell}>
      <div className="mx-auto max-w-4xl px-0 sm:px-4">
        <header className="px-4 pb-8 sm:px-0">
          <p className="font-serif text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Kosár</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">
            Tételek <span className="text-primary">({totalItems})</span>
          </h1>
        </header>

        <ul className="divide-y divide-border border-y border-border">
          {paginatedItems.map((item: CartItem, idx) => {
            const breakdown = priceBreakdownFromGross(item.price, item.quantity)
            return (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:gap-6 sm:px-6",
                  idx % 2 === 1 ? "bg-muted/25" : "bg-transparent"
                )}
              >
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-24 sm:w-24">
                  <FallbackImage
                    src={item.image}
                    alt={item.name}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.slug}`} className="font-serif text-xl font-semibold hover:text-primary">
                    {item.name}
                  </Link>
                  {item.variantLabel ? (
                    <p className="mt-1 font-serif text-xs uppercase tracking-widest text-primary">{item.variantLabel}</p>
                  ) : null}
                  <div className="mt-4 inline-flex items-center overflow-hidden rounded-full border border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2.5rem] text-center font-serif text-sm font-semibold">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="font-serif text-xl font-semibold">{formatHuf(breakdown.lineGross)}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>

        {totalPages > 1 ? (
          <div className="flex flex-wrap justify-center gap-2 px-4 pt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                type="button"
                variant={currentPage === i + 1 ? "default" : "outline"}
                className={cn("h-10 min-w-10 rounded-full font-serif", currentPage === i + 1 ? "" : "border-border")}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        ) : null}

        <section className="mx-4 mt-10 hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:mx-0 md:block">
          <h2 className="border-b border-border pb-3 font-serif text-lg font-semibold">Összesítő</h2>
          <div className="mt-4 space-y-2 font-serif text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Nettó</span>
              <span>{formatHuf(totalBreakdown.net)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>ÁFA</span>
              <span>{formatHuf(totalBreakdown.vat)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
              <span>Bruttó</span>
              <span>{formatHuf(totalBreakdown.gross)}</span>
            </div>
          </div>
          <Button
            type="button"
            disabled={checkoutSuggestionsLoading}
            className="mt-6 h-12 w-full rounded-full bg-primary font-serif text-sm uppercase tracking-widest text-primary-foreground"
            onClick={() => void beginCheckout()}
          >
            Pénztárhoz
            <ArrowRight className="ml-2 inline h-4 w-4" />
          </Button>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 font-serif">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Összesen</p>
            <p className="text-lg font-semibold">{formatHuf(totalBreakdown.gross)}</p>
          </div>
          <Button
            type="button"
            disabled={checkoutSuggestionsLoading}
            className="rounded-full bg-primary px-6 font-serif text-primary-foreground"
            onClick={() => void beginCheckout()}
          >
            Pénztár
          </Button>
        </div>
      </div>
      {checkoutModalUI}
    </main>
  )
}
