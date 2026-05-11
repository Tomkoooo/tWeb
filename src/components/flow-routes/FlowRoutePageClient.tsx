"use client"

import * as React from "react"
import { FALLBACK_TEMPLATE_ID, TEMPLATE_REGISTRY } from "@/templates/registry"
import type { FlowRouteKey } from "@/templates/types"
import { CartPageView } from "@/app/cart/CartPageView"
import { CheckoutPageView } from "@/app/checkout/CheckoutPageView"
import { ProfilePageView } from "@/app/profile/ProfilePageView"

type Variant = "page" | "embedded"

/**
 * Resolves `template.flowPages[route].RouteMain` or falls back to the engine default page body.
 */
export function FlowRoutePageClient({
  templateId,
  flowRoute,
  variant = "page",
}: {
  templateId: string
  flowRoute: FlowRouteKey
  variant?: Variant
}) {
  const [shopEnabled, setShopEnabled] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/shop/availability")
        if (!res.ok) {
          if (!cancelled) setShopEnabled(false)
          return
        }
        const data = await res.json()
        if (!cancelled) setShopEnabled(Boolean(data.enabled))
      } catch {
        if (!cancelled) setShopEnabled(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const mod = TEMPLATE_REGISTRY[templateId] ?? TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]
  const RouteMain = mod.flowPages?.[flowRoute]?.RouteMain

  if (RouteMain && shopEnabled === null) {
    return variant === "embedded" ? (
      <div className="flex justify-center py-12" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ) : (
      <p className="sr-only">Betöltés</p>
    )
  }

  if (RouteMain && shopEnabled !== null) {
    return <RouteMain shopEnabled={shopEnabled} variant={variant} />
  }

  if (flowRoute === "cart") return <CartPageView variant={variant} />
  if (flowRoute === "checkout") return <CheckoutPageView variant={variant} />
  return <ProfilePageView variant={variant} />
}
