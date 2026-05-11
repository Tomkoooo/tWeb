"use client"

import type { FlowRouteKey } from "@/templates/types"
import { FALLBACK_TEMPLATE_ID } from "@/templates/registry"
import { FlowRoutePageClient } from "@/components/flow-routes/FlowRoutePageClient"

/**
 * Mounts the same interactive flow UI as live routes inside CMS / template shell previews
 * (respects `flowPages.*.RouteMain` when the template defines it).
 */
export function FlowRouteInteractivePreview({
  route,
  templateId = FALLBACK_TEMPLATE_ID,
}: {
  route: FlowRouteKey
  templateId?: string
}) {
  return <FlowRoutePageClient templateId={templateId} flowRoute={route} variant="embedded" />
}
