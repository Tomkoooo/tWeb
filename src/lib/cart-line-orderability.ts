export type CartLineForOrderability = {
  productId: string
  variantId?: string
  quantity: number
  name?: string
}

export type ProductForCartOrderability = {
  name: string
  isActive?: boolean
  isVisible?: boolean
  stock?: number
  requireVariantSelection?: boolean
  variants?: Array<{
    id: string
    isActive?: boolean
    stock?: number
  }>
}

/** Human-readable reason when a cart line cannot be ordered (null = OK). */
export function getCartLineOrderabilityMessage(
  line: CartLineForOrderability,
  product: ProductForCartOrderability | null | undefined
): string | null {
  const label = line.name?.trim() || product?.name?.trim() || "A termék"

  if (!product) {
    return "A termék már nem található."
  }

  if (product.isActive === false || product.isVisible === false) {
    return `${label} jelenleg nem rendelhető.`
  }

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const requireVariantSelection = Boolean(product.requireVariantSelection) && hasVariants

  if (line.variantId) {
    if (!hasVariants) {
      return `Érvénytelen variáns: ${label}.`
    }
    const variant = product.variants!.find((entry) => entry.id === line.variantId)
    if (!variant) {
      return `A kiválasztott variáns már nem elérhető: ${label}.`
    }
    if (variant.isActive === false) {
      return `A kiválasztott variáns már nem elérhető: ${label}.`
    }
    const stock = Math.max(0, Number(variant.stock) || 0)
    if (stock <= 0) {
      return `${label} jelenleg nincs raktáron.`
    }
    if (line.quantity > stock) {
      return `Csak ${stock} db rendelhető (kosárban: ${line.quantity}).`
    }
    return null
  }

  if (requireVariantSelection) {
    return `Válassz variánst a termékhez: ${label}.`
  }

  const stock = Math.max(0, Number(product.stock) || 0)
  if (stock <= 0) {
    return `${label} jelenleg nincs raktáron.`
  }
  if (line.quantity > stock) {
    return `Csak ${stock} db rendelhető (kosárban: ${line.quantity}).`
  }

  return null
}
