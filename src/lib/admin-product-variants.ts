import { netToGross } from "@/lib/pricing"

export type AdminVariantRow = {
  id: string
  attributes: Record<string, string>
  sku?: string
  nameOverride?: string
  descriptionOverride?: string
  netPrice: number
  grossPrice?: number
  discount: number
  stock: number
  isActive: boolean
  isDefault: boolean
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

/** Treat 0 / missing variant price as “inherit product default”. */
export function resolveVariantNetPrice(
  variantNet: number | undefined | null,
  defaultNetPrice: number
): number {
  const n = Number(variantNet)
  if (Number.isFinite(n) && n > 0) return n
  return Number(defaultNetPrice) || 0
}

export function resolveVariantGrossPrice(
  variant: Pick<AdminVariantRow, "netPrice" | "grossPrice">,
  vatPercent: number,
  defaultGrossPrice?: number
): number {
  const gross = Number(variant.grossPrice)
  if (Number.isFinite(gross) && gross > 0) return gross
  const net = Number(variant.netPrice)
  if (Number.isFinite(net) && net > 0) return netToGross(net, vatPercent)
  if (defaultGrossPrice != null && defaultGrossPrice > 0) return defaultGrossPrice
  return 0
}

export function normalizeAdminVariants(
  variants: AdminVariantRow[],
  defaultNetPrice: number,
  vatPercent: number,
  defaultGrossPrice?: number
): AdminVariantRow[] {
  const fallbackGross =
    defaultGrossPrice != null && defaultGrossPrice > 0
      ? defaultGrossPrice
      : netToGross(defaultNetPrice, vatPercent)

  return variants.map((variant, index) => {
    const netPrice = resolveVariantNetPrice(variant.netPrice, defaultNetPrice)
    const grossPrice = resolveVariantGrossPrice(
      { netPrice, grossPrice: variant.grossPrice },
      vatPercent,
      fallbackGross
    )
    return {
      ...variant,
      id: variant.id || `variant-${index + 1}`,
      attributes: variant.attributes || {},
      netPrice,
      grossPrice,
      discount: Number(variant.discount ?? 0) || 0,
      stock: Number(variant.stock ?? 0) || 0,
      isActive: variant.isActive !== false,
      isDefault: Boolean(variant.isDefault),
      seo: {
        title: variant.seo?.title || "",
        description: variant.seo?.description || "",
        keywords: variant.seo?.keywords || [],
      },
    }
  })
}

export function variantGrossForDisplay(variant: AdminVariantRow, vatPercent: number): number {
  return resolveVariantGrossPrice(variant, vatPercent)
}

export function deriveVariantGrossBounds(variants: AdminVariantRow[], vatPercent: number) {
  const grosses = variants
    .filter((v) => v.isActive !== false)
    .map((v) => variantGrossForDisplay(v, vatPercent))
    .filter((g) => g > 0)
  if (grosses.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...grosses), max: Math.max(...grosses) }
}

export function deriveProductLevelFromVariants(variants: AdminVariantRow[]) {
  if (!variants.length) {
    return { netPrice: 0, grossPrice: 0, stock: 0, discount: 0 }
  }
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0]
  const gross = Number(defaultVariant.grossPrice)
  return {
    netPrice: Number(defaultVariant.netPrice) || 0,
    grossPrice: Number.isFinite(gross) && gross > 0 ? gross : 0,
    stock: variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
    discount: Math.max(0, ...variants.map((v) => Number(v.discount) || 0)),
  }
}
