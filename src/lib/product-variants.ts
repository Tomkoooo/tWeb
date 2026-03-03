type SeoShape = {
  title?: string;
  description?: string;
  keywords?: string[];
};

type VariantShape = {
  id: string;
  attributes?: Record<string, string>;
  nameOverride?: string;
  descriptionOverride?: string;
  netPrice: number;
  discount?: number;
  stock?: number;
  isActive?: boolean;
  isDefault?: boolean;
  images?: string[];
  seo?: SeoShape;
};

type ProductShape = {
  name: string;
  description: string;
  images?: string[];
  netPrice: number;
  discount?: number;
  stock?: number;
  seo?: SeoShape;
  variants?: VariantShape[];
  requireVariantSelection?: boolean;
};

export function hasVariants(product: ProductShape): boolean {
  return Array.isArray(product.variants) && product.variants.length > 0;
}

export function getActiveVariants(product: ProductShape): VariantShape[] {
  if (!hasVariants(product)) return [];
  return (product.variants || []).filter((variant) => variant.isActive !== false);
}

export function getVariantById(product: ProductShape, variantId?: string | null): VariantShape | null {
  if (!variantId || !hasVariants(product)) return null;
  const variants = getActiveVariants(product);
  return variants.find((variant) => variant.id === variantId) || null;
}

export function getDefaultVariant(product: ProductShape): VariantShape | null {
  if (!hasVariants(product)) return null;
  const variants = getActiveVariants(product);
  if (variants.length === 0) return null;
  return variants.find((variant) => variant.isDefault) || variants[0];
}

export function getVariantLabel(variant: VariantShape): string {
  const attrs = variant.attributes || {};
  const parts = Object.entries(attrs)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`);
  return parts.join(" / ") || variant.id;
}

export function resolveProductView(product: ProductShape, variantId?: string | null) {
  const selectedVariant = getVariantById(product, variantId);
  const activeVariants = getActiveVariants(product);
  const variantMinNetPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((variant) => variant.netPrice || product.netPrice))
      : product.netPrice;
  const variantMinDiscount =
    activeVariants.length > 0
      ? Math.max(...activeVariants.map((variant) => variant.discount || 0))
      : product.discount || 0;

  const netPrice = selectedVariant?.netPrice ?? product.netPrice;
  const discount = selectedVariant?.discount ?? product.discount ?? 0;
  const stock = selectedVariant?.stock ?? product.stock ?? 0;
  const name = selectedVariant?.nameOverride || product.name;
  const description = selectedVariant?.descriptionOverride || product.description;
  const images = selectedVariant?.images?.length ? selectedVariant.images : product.images || [];
  const variantKeywords = selectedVariant?.seo?.keywords || [];
  const productKeywords = product.seo?.keywords || [];
  const seo = {
    title: selectedVariant?.seo?.title || product.seo?.title || name,
    description: selectedVariant?.seo?.description || product.seo?.description || description.slice(0, 160),
    keywords: variantKeywords.length > 0 ? variantKeywords : productKeywords,
  };

  return {
    selectedVariant,
    hasVariantSelection: hasVariants(product),
    requiresVariantSelection: Boolean(product.requireVariantSelection) && hasVariants(product),
    hasValidSelection: Boolean(selectedVariant),
    name,
    description,
    images,
    netPrice,
    discount,
    stock,
    seo,
    minNetPrice: variantMinNetPrice,
    maxDiscount: variantMinDiscount,
  };
}
