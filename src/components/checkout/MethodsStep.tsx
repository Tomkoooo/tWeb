"use client"

import * as React from "react"
import { Truck, CreditCard, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  GLS_FIXED_SHIPPING_METHOD_ID,
  GLS_WIDGET_SCRIPT_ID,
  GLS_WIDGET_SCRIPT_URL,
  GlsParcelPoint,
} from "@/lib/gls"
import { formatHuf, totalsBreakdownFromGross } from "@/lib/pricing"

interface MethodsStepProps {
  data: MethodsStepData
  onChange: (data: MethodsStepData) => void
  methods?: CheckoutMethodsResponse | null
}

type CheckoutMethodItem = {
  _id: string
  name: string
  grossPrice: number
  isActive: boolean
}

type CheckoutMethodsResponse = {
  shippingMethods: CheckoutMethodItem[]
  paymentMethods: CheckoutMethodItem[]
}

type MethodsStepData = {
  shippingMethod: string
  paymentMethod: string
  glsParcelPoint?: GlsParcelPoint | null
}

export function MethodsStep({ data, onChange, methods: initialMethods }: MethodsStepProps) {
  const [methods, setMethods] = React.useState<CheckoutMethodsResponse | null>(initialMethods || null)
  const [loading, setLoading] = React.useState(true)
  const [glsElement, setGlsElement] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (initialMethods) {
      setMethods(initialMethods)
      setLoading(false)
      return
    }
    const fetchMethods = async () => {
      try {
        const res = await fetch("/api/checkout/methods")
        if (res.ok) {
          const fetched = await res.json()
          setMethods(fetched)
        }
      } catch (error) {
        console.error("Error fetching methods:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMethods()
  }, [initialMethods])

  const handleMethodChange = (type: "shippingMethod" | "paymentMethod", id: string) => {
    if (type === "shippingMethod" && id !== GLS_FIXED_SHIPPING_METHOD_ID) {
      onChange({ ...data, shippingMethod: id, glsParcelPoint: null })
      return
    }
    onChange({ ...data, [type]: id })
  }

  const isGlsSelected = data.shippingMethod === GLS_FIXED_SHIPPING_METHOD_ID

  React.useEffect(() => {
    if (!isGlsSelected) return
    const existing = document.getElementById(GLS_WIDGET_SCRIPT_ID)
    if (existing) return

    const script = document.createElement("script")
    script.id = GLS_WIDGET_SCRIPT_ID
    script.type = "module"
    script.src = GLS_WIDGET_SCRIPT_URL
    document.body.appendChild(script)
  }, [isGlsSelected])

  React.useEffect(() => {
    if (!isGlsSelected || !glsElement) return

    const handleParcelPointChange = (event: Event) => {
      const detail = (event as CustomEvent<GlsParcelPoint>).detail
      if (!detail?.id || !detail?.name) return
      onChange({ ...data, glsParcelPoint: detail })
    }

    glsElement.addEventListener("change", handleParcelPointChange)
    return () => {
      glsElement.removeEventListener("change", handleParcelPointChange)
    }
  }, [isGlsSelected, glsElement, onChange, data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-t-2 border-primary animate-spin rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Shipping Methods */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Szállítási mód</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {methods?.shippingMethods.map((method) => {
            const breakdown = totalsBreakdownFromGross(method.grossPrice)
            return (
            <button
              key={method._id}
              onClick={() => handleMethodChange("shippingMethod", method._id)}
              className={cn(
                "p-6 border-2 text-left transition-all duration-300 flex items-center justify-between group",
                data.shippingMethod === method._id ? "bg-white/5 border-primary" : "bg-black border-white/5 hover:border-white/10"
              )}
            >
              <div>
                <p className="font-black text-white uppercase tracking-widest text-xs mb-1">{method.name}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  Házhozszállítás várható ideje: 1-3 munkanap
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-white text-lg">{formatHuf(breakdown.gross)}</p>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                  Nettó {formatHuf(breakdown.net)} · ÁFA {formatHuf(breakdown.vat)}
                </p>
                {data.shippingMethod === method._id && <Check className="w-4 h-4 text-primary ml-auto mt-1" />}
              </div>
            </button>
            )
          })}
        </div>
        {isGlsSelected && (
          <div className="mt-6 border border-white/10 p-4 space-y-4">
            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
              GLS csomagpont kiválasztása kötelező
            </p>
            <div className="h-[420px] bg-black border border-white/10">
              {React.createElement("gls-dpm", {
                country: "hu",
                id: "checkout-gls-map",
                ref: (el: HTMLElement | null) => setGlsElement(el),
              })}
            </div>
            {data.glsParcelPoint?.id ? (
              <div className="p-3 bg-white/5 border border-primary/40">
                <p className="text-xs font-black text-white uppercase tracking-wider">
                  Kiválasztott pont: {data.glsParcelPoint.name}
                </p>
                <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest">
                  {data.glsParcelPoint.contact?.postalCode || ""} {data.glsParcelPoint.contact?.city || ""} {data.glsParcelPoint.contact?.address || ""}
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                Még nem választottál GLS csomagpontot.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Fizetési mód</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {methods?.paymentMethods.map((method) => {
            const breakdown = totalsBreakdownFromGross(method.grossPrice)
            return (
            <button
              key={method._id}
              onClick={() => handleMethodChange("paymentMethod", method._id)}
              className={cn(
                "p-6 border-2 text-left transition-all duration-300 flex items-center justify-between group",
                data.paymentMethod === method._id ? "bg-white/5 border-primary" : "bg-black border-white/5 hover:border-white/10"
              )}
            >
              <div>
                <p className="font-black text-white uppercase tracking-widest text-xs mb-1">{method.name}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  Kezelési költséggel együtt
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-white text-lg">{formatHuf(breakdown.gross)}</p>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                  Nettó {formatHuf(breakdown.net)} · ÁFA {formatHuf(breakdown.vat)}
                </p>
                {data.paymentMethod === method._id && <Check className="w-4 h-4 text-primary ml-auto mt-1" />}
              </div>
            </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
