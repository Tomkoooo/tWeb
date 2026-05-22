"use client"

import * as React from "react"
import { Truck, CreditCard, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  GLS_WIDGET_SCRIPT_ID,
  GLS_WIDGET_SCRIPT_URL,
  GlsParcelPoint,
} from "@/lib/gls"
import { type FoxpostParcelPoint } from "@/lib/foxpost"
import {
  isFoxpostParcelShippingMethod,
  isGlsParcelShippingMethod,
  isParcelShippingMethod,
} from "@/lib/shipping-providers"
import { FoxpostAptFinder } from "@/components/checkout/FoxpostAptFinder"
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
  provider?: string
  isFixed?: boolean
}

type CheckoutMethodsResponse = {
  shippingMethods: CheckoutMethodItem[]
  paymentMethods: CheckoutMethodItem[]
  meta?: {
    stripeConfigured?: boolean
    glsPickerEnabled?: boolean
    foxpostPickerEnabled?: boolean
  }
}

type MethodsStepData = {
  shippingMethod: string
  paymentMethod: string
  glsParcelPoint?: GlsParcelPoint | null
  foxpostParcelPoint?: FoxpostParcelPoint | null
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
  const hasGlsPoint = Boolean(data.glsParcelPoint?.id)
  const [glsMapOpen, setGlsMapOpen] = React.useState(!hasGlsPoint)

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

  React.useEffect(() => {
    if (!hasGlsPoint) setGlsMapOpen(true)
  }, [hasGlsPoint])

  const shippingList = methods?.shippingMethods ?? []
  const paymentList = methods?.paymentMethods ?? []
  const selectedShippingRow = shippingList.find((m) => m._id === data.shippingMethod)
  const isGlsSelected = isGlsParcelShippingMethod(data.shippingMethod, selectedShippingRow)
  const isFoxpostSelected = isFoxpostParcelShippingMethod(data.shippingMethod, selectedShippingRow)
  const stripeConfigured = Boolean(methods?.meta?.stripeConfigured)

  const handleMethodChange = (type: "shippingMethod" | "paymentMethod", id: string) => {
    if (type === "shippingMethod") {
      const nextMethod = methods?.shippingMethods?.find((m) => m._id === id)
      const clearsParcelPoints = !isParcelShippingMethod(id, nextMethod)
      const nextIsGls = isGlsParcelShippingMethod(id, nextMethod)
      const nextIsFoxpost = isFoxpostParcelShippingMethod(id, nextMethod)
      onChange({
        ...data,
        shippingMethod: id,
        glsParcelPoint: nextIsGls ? data.glsParcelPoint : null,
        foxpostParcelPoint: nextIsFoxpost ? data.foxpostParcelPoint : null,
      })
      return
    }
    onChange({ ...data, [type]: id })
  }

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
      setGlsMapOpen(false)
    }

    glsElement.addEventListener("change", handleParcelPointChange)
    return () => {
      glsElement.removeEventListener("change", handleParcelPointChange)
    }
  }, [isGlsSelected, glsElement, onChange, data])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-foreground/35" />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-primary-foreground" />
          <h3 className={cxSectionHeading(a)}>Szállítási mód</h3>
        </div>
        {shippingList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nincs elérhető szállítási mód. Ellenőrizd a GLS/Foxpost kapcsolókat és hogy az adminban van
            aktív szállítási sor (típus: GLS vagy Foxpost) árral.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-4">
          {shippingList.map((method) => {
            const breakdown = totalsBreakdownFromGross(method.grossPrice)
            const isParcel = isParcelShippingMethod(method._id, method)
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
                    {isParcel
                      ? "Csomagpont / automata — a térképen válaszd ki az átvételi helyet"
                      : "Házhozszállítás várható ideje: 1-3 munkanap"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cxMethodPrice(a)}>{formatHuf(breakdown.gross)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Nettó {formatHuf(breakdown.net)} · ÁFA {formatHuf(breakdown.vat)}
                  </p>
                  {data.shippingMethod === method._id && <Check className="ml-auto mt-1 h-4 w-4 text-primary-foreground" />}
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
            {glsMapOpen ? (
              <div className={cxGlsBox(a)}>
                {React.createElement("gls-dpm", {
                  country: "hu",
                  id: "checkout-gls-map",
                  ref: (el: HTMLElement | null) => setGlsElement(el),
                })}
              </div>
            ) : null}
            {hasGlsPoint && data.glsParcelPoint ? (
              <div
                className={cn(
                  "border p-3",
                  a === "light" ? "rounded-lg border-primary-foreground/40 bg-primary/5" : "bg-white/5 border border-primary-foreground/40"
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Még nem választottál GLS csomagpontot.</p>
            )}
            {hasGlsPoint && !glsMapOpen ? (
              <button
                type="button"
                onClick={() => setGlsMapOpen(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground underline-offset-2 hover:underline"
              >
                Másik GLS pont választása
              </button>
            ) : null}
          </div>
        )}
        {isFoxpostSelected && (
          <div
            className={cn(
              "mt-6 space-y-4 rounded-lg border p-4",
              a === "light" ? "border-border bg-muted/20" : "border-white/10"
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Foxpost csomagautomata kiválasztása kötelező
            </p>
            <FoxpostAptFinder
              appearance={a}
              selected={data.foxpostParcelPoint}
              onSelect={(point) => onChange({ ...data, foxpostParcelPoint: point })}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary-foreground" />
          <h3 className={cxSectionHeading(a)}>Fizetési mód</h3>
        </div>
        {paymentList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nincs elérhető fizetési mód. Kapcsold be a Stripe kapcsolót és állíts be{" "}
            <code className="text-xs">STRIPE_SECRET_KEY</code>-t, vagy adj hozzá egyéb fizetési módot
            adminban.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-4">
          {paymentList.map((method) => {
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
                  {data.paymentMethod === method._id && <Check className="ml-auto mt-1 h-4 w-4 text-primary-foreground" />}
                </div>
              </button>
            )
          })}
        </div>
        {paymentList.some((m) => m._id === "stripe_fixed") && !stripeConfigured ? (
          <p className="text-[11px] text-amber-500/90">
            A Stripe kapcsoló be van kapcsolva, de a szerveren hiányzik a STRIPE_SECRET_KEY — a kártyás
            fizetés nem fog működni, amíg nincs beállítva.
          </p>
        ) : null}
      </div>
    </div>
  )
}
