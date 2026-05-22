import { describe, expect, it } from "vitest"
import {
  cartLineProductId,
  dbCartItemsToCartItems,
  mergeLocalAndServerCart,
} from "@/lib/cart-sync"
import type { CartItem } from "@/store/useCartStore"

describe("cart-sync helpers", () => {
  it("cartLineProductId prefers productId", () => {
    expect(cartLineProductId({ id: "line-1", productId: "prod-1" })).toBe("prod-1")
    expect(cartLineProductId({ id: "prod-2" })).toBe("prod-2")
  })

  it("dbCartItemsToCartItems skips inactive products", () => {
    const items = dbCartItemsToCartItems([
      {
        quantity: 2,
        product: {
          _id: "p1",
          name: "A",
          slug: "a",
          netPrice: 1000,
          stock: 5,
          isActive: true,
          isVisible: true,
        },
      },
      {
        quantity: 1,
        product: {
          _id: "p2",
          name: "B",
          slug: "b",
          netPrice: 500,
          stock: 1,
          isActive: false,
          isVisible: true,
        },
      },
    ])
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe("p1")
    expect(items[0].quantity).toBe(2)
  })

  it("mergeLocalAndServerCart keeps variant lines and adds server-only products", () => {
    const local: CartItem[] = [
      {
        id: "p1:v1",
        productId: "p1",
        variantId: "v1",
        name: "Variant",
        slug: "p1",
        price: 100,
        image: "",
        quantity: 1,
        stock: 3,
        netPrice: 80,
        discount: 0,
      },
    ]
    const server: CartItem[] = [
      {
        id: "p1",
        productId: "p1",
        name: "Base",
        slug: "p1",
        price: 90,
        image: "",
        quantity: 2,
        stock: 3,
        netPrice: 70,
        discount: 0,
      },
      {
        id: "p2",
        productId: "p2",
        name: "Other",
        slug: "p2",
        price: 50,
        image: "",
        quantity: 1,
        stock: 10,
        netPrice: 40,
        discount: 0,
      },
    ]

    const merged = mergeLocalAndServerCart(local, server)
    expect(merged).toHaveLength(2)
    expect(merged[0].id).toBe("p1:v1")
    expect(merged[1].productId).toBe("p2")
  })
})
