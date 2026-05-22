"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/useCartStore"
import {
  cartLineProductId,
  dbCartItemsToCartItems,
  mergeLocalAndServerCart,
} from "@/lib/cart-sync"

const SAVE_DEBOUNCE_MS = 600

export function CartSync() {
  const { data: session, status } = useSession()
  const hasHydrated = useCartStore((s) => s._hasHydrated)
  const items = useCartStore((s) => s.items)
  const replaceItems = useCartStore((s) => s.replaceItems)

  const userId = session?.user?.id ?? null
  const initialSyncDoneRef = React.useRef<string | null>(null)
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    void useCartStore.persist.rehydrate()
  }, [])

  React.useEffect(() => {
    if (status !== "authenticated" || !userId || !hasHydrated) return
    if (initialSyncDoneRef.current === userId) return

    let cancelled = false

    const runInitialSync = async () => {
      const localItems = useCartStore.getState().items

      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: localItems }),
        })

        if (!response.ok || cancelled) return

        const dbCart = await response.json()
        const serverItems = dbCartItemsToCartItems(dbCart?.items)
        const merged = mergeLocalAndServerCart(localItems, serverItems)
        replaceItems(merged)
        initialSyncDoneRef.current = userId
      } catch (error) {
        console.error("Cart initial sync error:", error)
      }
    }

    void runInitialSync()

    return () => {
      cancelled = true
    }
  }, [status, userId, hasHydrated, replaceItems])

  React.useEffect(() => {
    if (status === "unauthenticated") {
      initialSyncDoneRef.current = null
    }
  }, [status])

  React.useEffect(() => {
    if (status !== "authenticated" || !userId || !hasHydrated) return
    if (initialSyncDoneRef.current !== userId) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(() => {
      const snapshot = useCartStore.getState().items
      void fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: snapshot }),
      }).catch((error) => {
        console.error("Cart save error:", error)
      })
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [items, status, userId, hasHydrated])

  return null
}
