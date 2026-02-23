"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Tag, AlertCircle } from "lucide-react"

interface SummaryStepProps {
  data: any
  onChange: (data: any) => void
  cartItems: any[]
  totalPrice: number
}

export function SummaryStep({ data, onChange, cartItems, totalPrice }: SummaryStepProps) {
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
          items: cartItems.map(i => i.id)
        })
      })

      if (res.ok) {
        const coupon = await res.json()
        onChange({ ...data, coupon })
      } else {
        const err = await res.json()
        setError(err.error || "Érvénytelen kód")
      }
    } catch (err) {
      setError("Hiba történt az érvényesítés során")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Coupon Entry */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
          <Tag className="w-5 h-5 text-[#FF5500]" />
          Kuponkód felhasználása
        </h3>
        
        {data.coupon ? (
          <div className="p-6 bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Alkalmazott kupon</p>
              <p className="text-lg font-black text-[#FF5500] uppercase tracking-tighter mt-1">{data.coupon.code}</p>
            </div>
            <Button 
              variant="krausz" 
              size="sm" 
              onClick={() => onChange({ ...data, coupon: null })}
              className="h-10 text-[10px]"
            >
              ELTÁVOLÍTÁS
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-grow">
              <Input 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="KUPONKÓD"
                className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-rose-500 text-[10px] font-black uppercase tracking-widest leading-none">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>
            <Button 
              onClick={applyCoupon}
              disabled={loading || !couponCode}
              className="h-14 px-8 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black rounded-none font-black uppercase tracking-widest text-[10px] transition-all"
            >
              ÉRVÉNYESÍTÉS
            </Button>
          </div>
        )}
      </div>

      {/* Review Section */}
      <div className="space-y-8 pt-8 border-t border-white/10">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Adatok ellenőrzése</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Számlázási információk</p>
            <div className="text-sm text-neutral-300 font-medium space-y-1">
              <p className="font-black text-white uppercase">{data.billing.name}</p>
              <p>{data.billing.zip} {data.billing.city}, {data.billing.street}</p>
              {data.billing.type === "company" && <p>Adószám: {data.billing.taxNumber}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Szállítási információk</p>
            <div className="text-sm text-neutral-300 font-medium space-y-1">
              {data.shipping.isSameAsBilling ? (
                <>
                  <p className="font-black text-white uppercase">{data.billing.name}</p>
                  <p>{data.billing.zip} {data.billing.city}, {data.billing.street}</p>
                </>
              ) : (
                <>
                  <p className="font-black text-white uppercase">{data.shipping.name}</p>
                  <p>{data.shipping.zip} {data.shipping.city}, {data.shipping.street}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
