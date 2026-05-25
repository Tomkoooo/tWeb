import type { ComponentType, ReactNode } from "react"
import { ProductCard as DefaultProductCard } from "@/components/shop/ProductCard"
import { ProductDetail as DefaultProductDetail } from "@/app/products/[slug]/ProductDetail"
import type {
  NavbarSearchSlotProps,
  ProductCardSlotProps,
  ProductDetailSlotProps,
  ShopPageDeps,
  TemplateModule,
} from "@/templates/types"

/** Resolved optional commerce primitives for the active template (defaults preserved). */
export type ResolvedCommerceSlots = {
  ProductCard: ComponentType<ProductCardSlotProps>
  ProductDetail: ComponentType<ProductDetailSlotProps>
  CategoryPill?: ComponentType<{ label: string; active?: boolean; href?: string }>
  PdpChrome?: ComponentType<{ product: unknown; children?: ReactNode }>
  NavbarSearch?: ComponentType<NavbarSearchSlotProps>
}

function DefaultProductDetailSlot(props: ProductDetailSlotProps) {
  return (
    <DefaultProductDetail
      product={props.product as never}
      initialVariantId={props.initialVariantId}
      shopEnabled={props.shopEnabled}
      editorial={props.editorial}
      introPlacement={props.introPlacement}
    />
  )
}

/** Storefront / chrome wiring; omit from CMS JSON deps — pass only from routes/layouts. */
export function resolveCommerceSlots(template: TemplateModule): ResolvedCommerceSlots {
  return {
    ProductCard: template.commerceSlots?.ProductCard ?? DefaultProductCard,
    ProductDetail: template.commerceSlots?.ProductDetail ?? DefaultProductDetailSlot,
    CategoryPill: template.commerceSlots?.CategoryPill,
    PdpChrome: template.commerceSlots?.PdpChrome,
    NavbarSearch: template.commerceSlots?.NavbarSearch,
  }
}

/** Same as `resolveCommerceSlots(template).ProductCard`; kept as a terse import where only the card is needed. */
export function resolveCommerceProductCard(
  template: TemplateModule
): ComponentType<ProductCardSlotProps> {
  return resolveCommerceSlots(template).ProductCard
}

/** `/shop` + CMS shop preview: product card plus optional category pill slot. */
export function resolveCommerceShopRendering(
  template: TemplateModule
): NonNullable<ShopPageDeps["shopRendering"]> {
  const s = resolveCommerceSlots(template)
  const out: NonNullable<ShopPageDeps["shopRendering"]> = { ProductCard: s.ProductCard }
  if (s.CategoryPill) {
    out.CategoryPill = s.CategoryPill
  }
  return out
}

export function resolveCommerceProductDetail(
  template: TemplateModule
): ComponentType<ProductDetailSlotProps> {
  return resolveCommerceSlots(template).ProductDetail
}

/**
 * Lazy lookup by id so `pages.pdp.Render` does not import `registry` at module scope (avoids circular init
 * with `TEMPLATE_REGISTRY` ↔ `template.config`).
 */
export function resolveCommerceProductDetailForId(
  templateId: string
): ComponentType<ProductDetailSlotProps> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const reg = require("@/templates/registry") as typeof import("@/templates/registry")
  const mod = reg.getTemplateById(templateId)
  return resolveCommerceProductDetail(mod)
}
