"use client"

import * as React from "react"
import type { CartItem } from "@/store/useCartStore"

function cartItemsSignature(items: CartItem[]): string {
  return items
    .map((item) => `${item.id}:${item.productId}:${item.variantId ?? ""}:${item.quantity}`)
    .join("|")
}

export function useCartLineIssues(items: CartItem[]) {
  const [issues, setIssues] = React.useState<Record<string, string>>({})
  const signature = cartItemsSignature(items)

  React.useEffect(() => {
    if (items.length === 0) {
      setIssues({})
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/cart/validate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              name: item.name,
            })),
          }),
        })
        if (!response.ok || cancelled) return
        const data = (await response.json()) as { issues?: Record<string, string> }
        if (!cancelled) setIssues(data.issues ?? {})
      } catch {
        if (!cancelled) setIssues({})
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- signature encodes line ids/qty
  }, [signature])

  const hasIssues = Object.keys(issues).length > 0
  return { issues, hasIssues }
}
