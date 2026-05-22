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
