"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/useCartStore"
import { mediaImageSrc } from "@/lib/images"
import { grossFromNetWithDiscount, clampVatPercent } from "@/lib/pricing"

export function CartSync() {
  const { data: session, status } = useSession()
  const items = useCartStore((state: any) => state.items)
  const clearCart = useCartStore((state: any) => state.clearCart)
  const addItem = useCartStore((state: any) => state.addItem)
  const [isSynced, setIsSynced] = React.useState(false)

  React.useEffect(() => {
    const syncCart = async () => {
      if (status === "authenticated" && !isSynced) {
        try {
          // Send current local items to sync with DB
          const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
          })

          if (response.ok) {
            const dbCart = await response.json()
            
            // Clear local and replace with DB items
            // This ensures we have the latest stock/price/status from DB
            clearCart()
            dbCart.items.forEach((dbItem: any) => {
              const vatPct = clampVatPercent(dbItem.product?.vatPercent)
              addItem({
                id: dbItem.product._id,
                productId: dbItem.product._id,
                name: dbItem.product.name,
                slug: dbItem.product.slug,
                price: grossFromNetWithDiscount(
                  dbItem.product.netPrice,
                  dbItem.product.discount || 0,
                  vatPct
                ),
                image: mediaImageSrc(dbItem.product.images?.[0]),
                quantity: dbItem.quantity,
                stock: dbItem.product.stock,
                netPrice: dbItem.product.netPrice,
                discount: dbItem.product.discount || 0,
                vatPercent: vatPct,
              })
            })
            setIsSynced(true)
          }
        } catch (error) {
          console.error("Cart sync error:", error);
        }
      }
    };

    if (status === "authenticated") {
      syncCart()
    } else if (status === "unauthenticated") {
      setIsSynced(false)
    }
  }, [status, isSynced])

  return null
}
