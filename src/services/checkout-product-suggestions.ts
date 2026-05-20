import { grossFromNetWithDiscount, clampVatPercent } from "@/lib/pricing"
import {
  DEFAULT_PRODUCT_SUGGESTION_SETTINGS,
  type ProductSuggestionSettings,
  type SuggestionSource,
} from "@/lib/product-suggestion-settings-schema"
import { getActiveVariants, getVariantLabel, resolveProductView } from "@/lib/product-variants"
import { mediaImageSrc } from "@/lib/images"
import { ProductService } from "@/services/product"

/** Public API / client: enough to call `useCartStore.getState().addItem` like PDP. */
export type CheckoutSuggestionItemDto = {
  id: string
  productId: string
  variantId?: string
  variantLabel?: string
  name: string
  slug: string
  price: number
  netPrice: number
  image: string
  stock: number
  discount: number
  /** Product VAT snapshot for cart totals. */
  vatPercent: number
  /** True when this exact cart line already exists — still listed so the modal can appear (e.g. admin preview / fixed list). */
  alreadyInCart?: boolean
}

const CATALOG_POOL_LIMIT = 240

export function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

/**
 * For suggestions we need a concrete variant when the PDP would require one.
 * Picks the cheapest in-stock active variant by gross-after-discount; undefined if none.
 */
export function pickCheapestInStockVariantId(product: {
  variants?: Array<{ id: string; netPrice: number; discount?: number; stock?: number; isActive?: boolean }>
}): string | undefined {
  const active = getActiveVariants(product as Parameters<typeof getActiveVariants>[0]).filter(
    (v) => (Number(v.stock) || 0) > 0
  )
  if (active.length === 0) return undefined
  const pct = clampVatPercent((product as { vatPercent?: unknown }).vatPercent)
  const sorted = [...active].sort(
    (a, b) =>
      grossFromNetWithDiscount(a.netPrice, a.discount || 0, pct) -
      grossFromNetWithDiscount(b.netPrice, b.discount || 0, pct)
  )
  return sorted[0]?.id
}

function mapLeanProductToDto(product: any, forcedVariantId?: string | null): CheckoutSuggestionItemDto | null {
  if (!product?._id || !product.slug) return null
  const requiresVariant =
    Boolean(product.requireVariantSelection) && getActiveVariants(product).length > 0
  const variantId = requiresVariant ? forcedVariantId ?? pickCheapestInStockVariantId(product) : forcedVariantId
  if (requiresVariant && !variantId) return null

  const view = resolveProductView(product, variantId ?? null)
  if (!view || (view.stock ?? 0) <= 0) return null

  const selected = view.selectedVariant
  const productId = product._id.toString()
  const id = selected ? `${productId}:${selected.id}` : productId
  const variantLabel = selected ? getVariantLabel(selected as Parameters<typeof getVariantLabel>[0]) : undefined
  const pct = clampVatPercent(product.vatPercent)

  return {
    id,
    productId,
    variantId: selected?.id,
    variantLabel,
    name: view.name,
    slug: product.slug,
    price: grossFromNetWithDiscount(view.netPrice, view.discount, pct),
    netPrice: view.netPrice,
    image: mediaImageSrc(view.images?.[0]),
    stock: view.stock,
    discount: view.discount,
    vatPercent: pct,
  }
}

function dedupeKey(dto: CheckoutSuggestionItemDto): string {
  return dto.id
}

async function loadProductPool(filters: Parameters<typeof ProductService.getPaginated>[2]): Promise<any[]> {
  const { products } = await ProductService.getPaginated(1, CATALOG_POOL_LIMIT, {
    isActive: true,
    isVisible: true,
    ...filters,
  })
  return products
}

async function productsFromFixedIds(ids: string[]): Promise<any[]> {
  const out: any[] = []
  for (const id of ids) {
    const p = await ProductService.getById(id)
    if (p && (p as any).isActive && (p as any).isVisible !== false) {
      out.push(p)
    }
  }
  return out
}

function defaultTakePerSource(maxSuggestions: number, sourceCount: number): number {
  if (sourceCount <= 0) return maxSuggestions
  return Math.max(1, Math.ceil(maxSuggestions / sourceCount))
}

/**
 * Merge ordered sources: each source contributes up to `take` (or default split), capped by `maxSuggestions`.
 *
 * - **random_** / **category**: skips products whose `productId` is in `excludeProductIds` (cart).
 * - **fixed_products**: does **not** skip by productId so admin-picked items still appear; rows that match an
 *   existing cart line id get `alreadyInCart: true` (same UX as "already have this exact variant").
 * - Dedupes duplicate line ids within the merged suggestion list.
 */
export async function resolveCheckoutSuggestionItems(
  settings: ProductSuggestionSettings,
  opts: { excludeProductIds: Set<string>; excludeLineIds: Set<string> }
): Promise<CheckoutSuggestionItemDto[]> {
  const max = settings.maxSuggestions ?? DEFAULT_PRODUCT_SUGGESTION_SETTINGS.maxSuggestions
  const sources = settings.sources ?? []
  if (!settings.enabled || sources.length === 0 || max <= 0) return []

  const excludeProductIds = opts.excludeProductIds
  const excludeLineIds = opts.excludeLineIds
  const out: CheckoutSuggestionItemDto[] = []
  const seenLineIds = new Set<string>()
  const perDefault = defaultTakePerSource(max, sources.length)

  for (const source of sources as SuggestionSource[]) {
    if (out.length >= max) break
    const need = Math.min(max - out.length, sourceTake(source, perDefault))
    const isFixed = source.type === "fixed_products"

    let pool: any[] = []
    switch (source.type) {
      case "random_catalog":
        pool = await loadProductPool({})
        shuffleInPlace(pool)
        break
      case "random_price_range": {
        const lo = Math.min(source.minNet, source.maxNet)
        const hi = Math.max(source.minNet, source.maxNet)
        pool = await loadProductPool({ minPrice: lo, maxPrice: hi })
        shuffleInPlace(pool)
        break
      }
      case "category":
        pool = await loadProductPool({ category: source.categoryId })
        shuffleInPlace(pool)
        break
      case "fixed_products":
        pool = await productsFromFixedIds(source.productIds)
        break
      default:
        break
    }

    let added = 0
    for (const p of pool) {
      if (added >= need || out.length >= max) break
      const pid = p._id?.toString?.()
      if (!pid) continue
      if (!isFixed && excludeProductIds.has(pid)) continue

      const dto = mapLeanProductToDto(p)
      if (!dto) continue
      if (seenLineIds.has(dedupeKey(dto))) continue

      const alreadyInCart = excludeLineIds.has(dto.id)
      if (!isFixed && alreadyInCart) continue

      seenLineIds.add(dto.id)
      out.push(isFixed && alreadyInCart ? { ...dto, alreadyInCart: true } : dto)
      added++
    }
  }

  return out
}

function sourceTake(source: SuggestionSource, fallback: number): number {
  if ("take" in source && typeof source.take === "number") return source.take
  return fallback
}
