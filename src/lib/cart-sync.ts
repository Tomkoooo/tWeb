import { mediaImageSrc } from "@/lib/images"
import { grossFromNetWithDiscount, clampVatPercent } from "@/lib/pricing"
import type { CartItem } from "@/store/useCartStore"

export function cartLineProductId(item: { productId?: string; id: string }): string {
  return String(item.productId || item.id)
}

export function cartItemsSyncSignature(
  items: Array<{ productId?: string; id: string; quantity: number }>
): string {
  return JSON.stringify(
    items
      .map((item) => ({
        productId: cartLineProductId(item),
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId))
  )
}

export function areCartItemsSyncEqual(
  a: Array<{ productId?: string; id: string; quantity: number }>,
  b: Array<{ productId?: string; id: string; quantity: number }>
): boolean {
  return cartItemsSyncSignature(a) === cartItemsSyncSignature(b)
}

type DbCartProduct = {
  _id?: string | { toString(): string }
  name?: string
  slug?: string
  netPrice?: number
  discount?: number
  vatPercent?: number
  images?: string[]
  stock?: number
  isActive?: boolean
  isVisible?: boolean
}

type DbCartLine = {
  product?: DbCartProduct | null
  quantity?: number
}

function productIdString(product: DbCartProduct | null | undefined): string | null {
  if (!product?._id) return null
  return typeof product._id === "string" ? product._id : product._id.toString()
}

/** Map populated Mongo cart lines to client cart items (product-level lines). */
export function dbCartItemsToCartItems(dbItems: DbCartLine[] | undefined): CartItem[] {
  if (!Array.isArray(dbItems)) return []

  const result: CartItem[] = []
  for (const dbItem of dbItems) {
    const product = dbItem.product
    const productId = productIdString(product)
    if (!productId || !product?.name || !product.slug) continue
    if (product.isActive === false || product.isVisible === false) continue

    const qty = Math.max(1, Number(dbItem.quantity) || 1)
    const vatPct = clampVatPercent(product.vatPercent)
    const netPrice = Number(product.netPrice) || 0
    const discount = Number(product.discount) || 0

    result.push({
      id: productId,
      productId,
      name: product.name,
      slug: product.slug,
      price: grossFromNetWithDiscount(netPrice, discount, vatPct),
      image: mediaImageSrc(product.images?.[0]),
      quantity: qty,
      stock: Math.max(0, Number(product.stock) || 0),
      netPrice,
      discount,
      vatPercent: vatPct,
    })
  }
  return result
}

/** Prefer local variant lines; fill in product-only lines from the server. */
export function mergeLocalAndServerCart(local: CartItem[], server: CartItem[]): CartItem[] {
  const merged: CartItem[] = []
  const seenProducts = new Set<string>()

  for (const line of local) {
    merged.push(line)
    seenProducts.add(cartLineProductId(line))
  }

  for (const line of server) {
    if (seenProducts.has(line.productId)) continue
    merged.push(line)
    seenProducts.add(line.productId)
  }

  return merged
}
