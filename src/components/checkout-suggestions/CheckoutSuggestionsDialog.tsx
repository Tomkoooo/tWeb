"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/useCartStore"
import type { CartItem } from "@/store/useCartStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FallbackImage } from "@/components/common/FallbackImage"
import { formatHuf } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { CheckoutSuggestionItemDto } from "@/services/checkout-product-suggestions"

/** Optional Tailwind (or arbitrary) classes for templates to restyle the checkout suggestions modal. */
export type CheckoutSuggestionsDialogPresentation = {
  contentClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  listClassName?: string
  itemClassName?: string
  footerClassName?: string
  primaryButtonClassName?: string
  secondaryButtonClassName?: string
}

export type CheckoutSuggestionsDialogProps = {
  open: boolean
  /** Sync open state; when transitioning to closed, parent clears payload and navigates to checkout. */
  onDialogOpenChange: (open: boolean) => void
  loading: boolean
  items: CheckoutSuggestionItemDto[]
  modalTitle?: string
  modalHelper?: string
  selectedIds: Set<string>
  onToggle: (lineId: string) => void
  onAddSelectedAndCheckout: () => void
  presentation?: CheckoutSuggestionsDialogPresentation
}

export function CheckoutSuggestionsDialog({
  open,
  loading,
  items,
  modalTitle,
  modalHelper,
  selectedIds,
  onToggle,
  onDialogOpenChange,
  onAddSelectedAndCheckout,
  presentation,
}: CheckoutSuggestionsDialogProps) {
  const p = presentation ?? {}
  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-background text-foreground sm:max-w-2xl",
          p.contentClassName
        )}
      >
        <DialogHeader>
          <DialogTitle className={cn("text-foreground", p.titleClassName)}>
            {modalTitle?.trim() || "Még valami a kosárba?"}
          </DialogTitle>
          {modalHelper?.trim() ? (
            <DialogDescription className={cn("text-muted-foreground", p.descriptionClassName)}>
              {modalHelper}
            </DialogDescription>
          ) : (
            <DialogDescription className={cn("text-muted-foreground", p.descriptionClassName)}>
              Válassz javasolt termékeket, vagy lépj tovább a pénztárba.
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12" aria-busy="true">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ul className={cn("space-y-3", p.listClassName)}>
            {items.map((it) => (
              <li
                key={it.id}
                className={cn(
                  "flex items-center gap-4 border border-border p-3 transition-colors",
                  selectedIds.has(it.id) ? "border-primary/50 bg-muted/30" : "opacity-90",
                  it.alreadyInCart && "border-muted bg-muted/20 opacity-100",
                  p.itemClassName
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
                  checked={it.alreadyInCart ? false : selectedIds.has(it.id)}
                  disabled={Boolean(it.alreadyInCart)}
                  onChange={() => {
                    if (it.alreadyInCart) return
                    onToggle(it.id)
                  }}
                  aria-label={`${it.name} kijelölése`}
                />
                <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-border bg-muted">
                  <FallbackImage src={it.image} alt="" width={64} height={64} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-black text-sm uppercase leading-tight text-foreground">{it.name}</p>
                  {it.variantLabel ? (
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">{it.variantLabel}</p>
                  ) : null}
                  <p className="mt-1 text-sm font-black text-primary">{formatHuf(it.price)}</p>
                  {it.alreadyInCart ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">Ez a tétel már a kosárban van.</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className={cn("gap-2 sm:justify-between sm:gap-4", p.footerClassName)}>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "rounded-none border-border font-black uppercase tracking-widest text-[10px]",
              p.secondaryButtonClassName
            )}
            onClick={() => onDialogOpenChange(false)}
          >
            Nem, tovább a pénztár
          </Button>
          <Button
            type="button"
            className={cn(
              "rounded-none bg-primary font-black uppercase tracking-widest text-[10px] text-primary-foreground",
              p.primaryButtonClassName
            )}
            disabled={loading}
            onClick={onAddSelectedAndCheckout}
          >
            Kosárba és pénztár
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function dtoToCartItem(dto: CheckoutSuggestionItemDto): CartItem {
  return {
    id: dto.id,
    productId: dto.productId,
    variantId: dto.variantId,
    variantLabel: dto.variantLabel,
    selectedAttributes: {},
    name: dto.name,
    slug: dto.slug,
    price: dto.price,
    image: dto.image,
    quantity: 1,
    stock: dto.stock,
    netPrice: dto.netPrice,
    discount: dto.discount,
    vatPercent: dto.vatPercent,
  }
}

export type UseCheckoutWithSuggestionsOptions = {
  /** Pass Tailwind classes to match your template’s cart / typography (Atelier uses serif + rounded). */
  dialogPresentation?: CheckoutSuggestionsDialogPresentation
}

export function useCheckoutWithSuggestions(options: UseCheckoutWithSuggestionsOptions = {}) {
  const { dialogPresentation } = options
  const router = useRouter()
  const cartItems = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)

  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [payload, setPayload] = React.useState<{
    items: CheckoutSuggestionItemDto[]
    modalTitle?: string
    modalHelper?: string
  } | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const navigateCheckoutOnly = React.useCallback(() => {
    router.push("/checkout")
  }, [router])

  const handleDialogOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        setPayload(null)
        setSelectedIds(new Set())
        router.push("/checkout")
      }
    },
    [router]
  )

  const beginCheckout = React.useCallback(async () => {
    setLoading(true)
    try {
      const excludeProductIds = cartItems.map((i) => i.productId)
      const excludeLineIds = cartItems.map((i) => i.id)
      const res = await fetch("/api/shop/product-suggestions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ excludeProductIds, excludeLineIds }),
      })
      if (!res.ok) {
        navigateCheckoutOnly()
        return
      }
      const data = (await res.json()) as {
        items: CheckoutSuggestionItemDto[]
        modalTitle?: string
        modalHelper?: string
      }
      if (!data.items?.length) {
        navigateCheckoutOnly()
        return
      }
      setPayload({
        items: data.items,
        modalTitle: data.modalTitle,
        modalHelper: data.modalHelper,
      })
      setSelectedIds(
        new Set(data.items.filter((i) => !i.alreadyInCart).map((i) => i.id))
      )
      setOpen(true)
    } catch {
      navigateCheckoutOnly()
    } finally {
      setLoading(false)
    }
  }, [cartItems, navigateCheckoutOnly])

  const toggle = React.useCallback((lineId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(lineId)) next.delete(lineId)
      else next.add(lineId)
      return next
    })
  }, [])

  const onAddSelectedAndCheckout = React.useCallback(() => {
    if (!payload) {
      navigateCheckoutOnly()
      return
    }
    for (const it of payload.items) {
      if (it.alreadyInCart) continue
      if (selectedIds.has(it.id)) {
        addItem(dtoToCartItem(it))
      }
    }
    handleDialogOpenChange(false)
  }, [payload, selectedIds, addItem, handleDialogOpenChange, navigateCheckoutOnly])

  const checkoutModalUI = React.useMemo(
    () => (
      <CheckoutSuggestionsDialog
        open={open}
        onDialogOpenChange={handleDialogOpenChange}
        loading={loading}
        items={payload?.items ?? []}
        modalTitle={payload?.modalTitle}
        modalHelper={payload?.modalHelper}
        selectedIds={selectedIds}
        onToggle={toggle}
        onAddSelectedAndCheckout={onAddSelectedAndCheckout}
        presentation={dialogPresentation}
      />
    ),
    [open, loading, payload, selectedIds, toggle, handleDialogOpenChange, onAddSelectedAndCheckout, dialogPresentation]
  )

  return { beginCheckout, checkoutModalUI, checkoutSuggestionsLoading: loading }
}

/**
 * Template-facing control: renders a button (slot for label) and the checkout-suggestions modal.
 * Custom `flowPages.cart.RouteMain` implementations should use this instead of linking straight to `/checkout`.
 */
export function CheckoutSuggestionsGate({
  className,
  disabled,
  children,
  dialogPresentation,
}: {
  className?: string
  disabled?: boolean
  children: React.ReactNode
  dialogPresentation?: CheckoutSuggestionsDialogPresentation
}) {
  const { beginCheckout, checkoutModalUI, checkoutSuggestionsLoading } = useCheckoutWithSuggestions({
    dialogPresentation,
  })
  return (
    <>
      <Button
        type="button"
        className={className}
        disabled={disabled || checkoutSuggestionsLoading}
        onClick={() => void beginCheckout()}
      >
        {children}
      </Button>
      {checkoutModalUI}
    </>
  )
}
