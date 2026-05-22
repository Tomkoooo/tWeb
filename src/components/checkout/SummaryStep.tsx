"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type CheckoutStepAppearance,
  cxDivider,
  cxInput,
  cxSectionHeading,
  cxSummaryMuted,
  cxSummaryStrong,
} from "@/components/checkout/checkout-appearance"

interface SummaryStepProps {
  data: any
  onChange: (data: any) => void
  cartItems: any[]
  totalPrice: number
  /** @default "dark" */
  appearance?: CheckoutStepAppearance
  /** When true, show opt-in to store billing/shipping on the user profile after order (default on in wizard). */
  isAuthenticated?: boolean
}

export function SummaryStep({
  data,
  onChange,
  cartItems,
  totalPrice,
  appearance = "dark",
  isAuthenticated = false,
}: SummaryStepProps) {
  const a = appearance
  const [couponCode, setCouponCode] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const applyCoupon = async () => {
    if (!couponCode) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/checkout/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartValue: totalPrice,
          items: cartItems.map((i) => i.productId || i.id),
        }),
      })

      if (res.ok) {
        const coupon = await res.json()
        onChange({ ...data, coupon })
      } else {
        const err = await res.json()
        setError(err.error || "Érvénytelen kód")
      }
    } catch {
      setError("Hiba történt az érvényesítés során")
    } finally {
      setLoading(false)
    }
  }

  const couponRemoveBtn =
    a === "light" ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange({ ...data, coupon: null })}
        className="h-10 rounded-lg border-border font-serif text-xs uppercase"
      >
        Eltávolítás
      </Button>
    ) : (
      <Button variant="krausz" size="sm" onClick={() => onChange({ ...data, coupon: null })} className="h-10 text-[10px]">
        ELTÁVOLÍTÁS
      </Button>
    )

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-6">
        <h3 className={cn(cxSectionHeading(a), "flex items-center gap-3")}>
          <Tag className="h-5 w-5 text-primary-foreground" />
          Kuponkód felhasználása
        </h3>

        {data.coupon ? (
          <div
            className={cn(
              "flex items-center justify-between border p-6",
              a === "light" ? "rounded-xl border-primary-foreground/30 bg-primary/10" : "border-primary-foreground/30 bg-primary/10"
            )}
          >
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", a === "light" ? "text-foreground" : "text-white")}>
                Alkalmazott kupon
              </p>
              <p className="mt-1 text-lg font-bold uppercase tracking-tighter text-primary-foreground">{data.coupon.code}</p>
            </div>
            {couponRemoveBtn}
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="min-w-0 grow">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="KUPONKÓD"
                className={cxInput(a)}
              />
              {error && (
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase leading-none tracking-widest text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={applyCoupon}
              disabled={loading || !couponCode}
              className={cn(
                "h-12 shrink-0 rounded-lg px-8 font-semibold uppercase tracking-widest sm:h-auto sm:self-start",
                a === "light"
                  ? "border border-border bg-primary text-primary-foreground hover:bg-primary/90"
                  : "h-14 rounded-none border border-white/10 bg-white/5 text-white hover:bg-white hover:text-black"
              )}
            >
              Érvényesítés
            </Button>
          </div>
        )}
      </div>

      <div className={cn("space-y-8 border-t pt-8", cxDivider(a))}>
        <h3 className={cxSectionHeading(a)}>Adatok ellenőrzése</h3>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <p
              className={cn(
                "border-b pb-2 text-[10px] font-bold uppercase tracking-widest",
                a === "light" ? "border-border text-muted-foreground" : "border-white/5 text-neutral-500"
              )}
            >
              Számlázási információk
            </p>
            <div className={cxSummaryMuted(a)}>
              <p className={cxSummaryStrong(a)}>{data.billing.name}</p>
              <p>
                {data.billing.zip} {data.billing.city}, {data.billing.street}
              </p>
              {data.billing.type === "company" && <p>Adószám: {data.billing.taxNumber}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <p
              className={cn(
                "border-b pb-2 text-[10px] font-bold uppercase tracking-widest",
                a === "light" ? "border-border text-muted-foreground" : "border-white/5 text-neutral-500"
              )}
            >
              Szállítási információk
            </p>
            <div className={cxSummaryMuted(a)}>
              {data.shipping.isSameAsBilling ? (
                <>
                  <p className={cxSummaryStrong(a)}>{data.billing.name}</p>
                  <p>
                    {data.billing.zip} {data.billing.city}, {data.billing.street}
                  </p>
                </>
              ) : (
                <>
                  <p className={cxSummaryStrong(a)}>{data.shipping.name}</p>
                  <p>
                    {data.shipping.zip} {data.shipping.city}, {data.shipping.street}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
              a === "light" ? "border-border bg-muted/30" : "border-white/10 bg-white/3"
            )}
          >
            <input
              type="checkbox"
              className={cn(
                "mt-0.5 size-4 shrink-0 rounded border accent-primary",
                a === "light" ? "border-border" : "border-white/20 bg-black"
              )}
              checked={data.saveAddressToProfile !== false}
              onChange={(e) => onChange({ ...data, saveAddressToProfile: e.target.checked })}
            />
            <span
              className={cn(
                "text-xs font-medium leading-snug",
                a === "light" ? "text-foreground" : "text-neutral-300"
              )}
            >
              Mentsük el a számlázási és szállítási adatokat a profilomba a következő vásárlásokhoz.
            </span>
          </label>
        ) : null}
      </div>
    </div>
  )
}
