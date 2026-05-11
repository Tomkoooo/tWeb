"use client"

import { createElement, useMemo } from "react"
import { resolveCommerceProductDetailForId } from "@/templates/resolve-commerce-slots"
import type { ProductDetailSlotProps } from "@/templates/types"

type Props = ProductDetailSlotProps & { templateId: string }

/** Renders `commerceSlots.ProductDetail` when defined, else the engine default PDP body. */
export function ResolvedTemplateProductDetail({ templateId, ...slotProps }: Props) {
  const Cmp = useMemo(() => resolveCommerceProductDetailForId(templateId), [templateId])
  return createElement(Cmp, slotProps)
}
