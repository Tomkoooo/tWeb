import type { TemplateModule } from "./types"
import { defaultModern } from "./default-modern/template.config"
import { minimalShop } from "./minimal-shop/template.config"
import { vividStorefront } from "./vivid-storefront/template.config"

export const FALLBACK_TEMPLATE_ID = "default-modern" as const

export const TEMPLATE_REGISTRY: Record<string, TemplateModule> = {
  "default-modern": defaultModern,
  "minimal-shop": minimalShop,
  "vivid-storefront": vividStorefront,
}

export function getTemplateById(id: string | undefined | null): TemplateModule {
  if (!id) return TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]
  return TEMPLATE_REGISTRY[id] ?? TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]
}

export function listTemplates(): TemplateModule[] {
  return Object.values(TEMPLATE_REGISTRY)
}
