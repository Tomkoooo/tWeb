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
import {
  type CheckoutStepAppearance,
  cxGlsBox,
  cxMethodCard,
  cxMethodPrice,
  cxMethodTitle,
  cxSectionHeading,
} from "@/components/checkout/checkout-appearance"

interface MethodsStepProps {
  data: MethodsStepData
  onChange: (data: MethodsStepData) => void
  methods?: CheckoutMethodsResponse | null
  /** @default "dark" */
  appearance?: CheckoutStepAppearance
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

export function MethodsStep({
  data,
  onChange,
  methods: initialMethods,
  appearance = "dark",
}: MethodsStepProps) {
  const a = appearance
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
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-primary" />
          <h3 className={cxSectionHeading(a)}>Szállítási mód</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {methods?.shippingMethods.map((method) => {
            const breakdown = totalsBreakdownFromGross(method.grossPrice)
            return (
              <button
                key={method._id}
                type="button"
                onClick={() => handleMethodChange("shippingMethod", method._id)}
                className={cxMethodCard(a, data.shippingMethod === method._id)}
              >
                <div>
                  <p className={cxMethodTitle(a)}>{method.name}</p>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Házhozszállítás várható ideje: 1-3 munkanap
                  </p>
                </div>
                <div className="text-right">
                  <p className={cxMethodPrice(a)}>{formatHuf(breakdown.gross)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Nettó {formatHuf(breakdown.net)} · ÁFA {formatHuf(breakdown.vat)}
                  </p>
                  {data.shippingMethod === method._id && <Check className="ml-auto mt-1 h-4 w-4 text-primary" />}
                </div>
              </button>
            )
          })}
        </div>
        {isGlsSelected && (
          <div
            className={cn(
              "mt-6 space-y-4 rounded-lg border p-4",
              a === "light" ? "border-border bg-muted/20" : "border-white/10"
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              GLS csomagpont kiválasztása kötelező
            </p>
            <div className={cxGlsBox(a)}>
              {React.createElement("gls-dpm", {
                country: "hu",
                id: "checkout-gls-map",
                ref: (el: HTMLElement | null) => setGlsElement(el),
              })}
            </div>
            {data.glsParcelPoint?.id ? (
              <div
                className={cn(
                  "border p-3",
                  a === "light" ? "rounded-lg border-primary/40 bg-primary/5" : "bg-white/5 border border-primary/40"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    a === "light" ? "text-foreground" : "text-white"
                  )}
                >
                  Kiválasztott pont: {data.glsParcelPoint.name}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {data.glsParcelPoint.contact?.postalCode || ""} {data.glsParcelPoint.contact?.city || ""}{" "}
                  {data.glsParcelPoint.contact?.address || ""}
                </p>
              </div>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Még nem választottál GLS csomagpontot.</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className={cxSectionHeading(a)}>Fizetési mód</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {methods?.paymentMethods.map((method) => {
            const breakdown = totalsBreakdownFromGross(method.grossPrice)
            return (
              <button
                key={method._id}
                type="button"
                onClick={() => handleMethodChange("paymentMethod", method._id)}
                className={cxMethodCard(a, data.paymentMethod === method._id)}
              >
                <div>
                  <p className={cxMethodTitle(a)}>{method.name}</p>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Kezelési költséggel együtt
                  </p>
                </div>
                <div className="text-right">
                  <p className={cxMethodPrice(a)}>{formatHuf(breakdown.gross)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Nettó {formatHuf(breakdown.net)} · ÁFA {formatHuf(breakdown.vat)}
                  </p>
                  {data.paymentMethod === method._id && <Check className="ml-auto mt-1 h-4 w-4 text-primary" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
