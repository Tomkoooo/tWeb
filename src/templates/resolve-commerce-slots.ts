import type { ComponentType, ReactNode } from "react"
import { ProductCard as DefaultProductCard } from "@/components/shop/ProductCard"
import type { NavbarSearchSlotProps, TemplateModule } from "@/templates/types"

/** Resolved optional commerce primitives for the active template (defaults preserved). */
export type ResolvedCommerceSlots = {
  ProductCard: ComponentType<{ product: unknown }>
  CategoryPill?: ComponentType<{ label: string; active?: boolean; href?: string }>
  PdpChrome?: ComponentType<{ product: unknown; children?: ReactNode }>
  NavbarSearch?: ComponentType<NavbarSearchSlotProps>
}

/** Storefront / chrome wiring; omit from CMS JSON deps — pass only from routes/layouts. */
export function resolveCommerceSlots(template: TemplateModule): ResolvedCommerceSlots {
  return {
    ProductCard: template.commerceSlots?.ProductCard ?? DefaultProductCard,
    CategoryPill: template.commerceSlots?.CategoryPill,
    PdpChrome: template.commerceSlots?.PdpChrome,
    NavbarSearch: template.commerceSlots?.NavbarSearch,
  }
}

/** Same as `resolveCommerceSlots(template).ProductCard`; kept as a terse import where only the card is needed. */
export function resolveCommerceProductCard(
  template: TemplateModule
): ComponentType<{ product: unknown }> {
  return resolveCommerceSlots(template).ProductCard
}
