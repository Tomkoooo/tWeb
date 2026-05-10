"use client"

import type { FlowRouteKey } from "@/templates/types"
import { CartPageView } from "@/app/cart/CartPageView"
import { CheckoutPageView } from "@/app/checkout/CheckoutPageView"
import { ProfilePageView } from "@/app/profile/ProfilePageView"

/**
 * Mounts the same interactive engine UI as `/cart`, `/checkout`, `/profile` inside CMS / template shell previews.
 */
export function FlowRouteInteractivePreview({ route }: { route: FlowRouteKey }) {
  switch (route) {
    case "cart":
      return <CartPageView variant="embedded" />
    case "checkout":
      return <CheckoutPageView variant="embedded" />
    case "profile":
      return <ProfilePageView variant="embedded" />
    default:
      return null
  }
}
