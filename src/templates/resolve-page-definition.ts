import { flowShellDefinitionAsPageDefinition } from "@/templates/flow-shell-as-page-definition"
import type { FlowRouteKey, PageDefinition, TemplateModule } from "@/templates/types"

const FLOW_PAGE_KEY_TO_ROUTE: Record<string, FlowRouteKey> = {
  "page:cart": "cart",
  "page:checkout": "checkout",
  "page:profile": "profile",
}

export function findPageDefinition(
  template: TemplateModule,
  pageKey: string
): PageDefinition<unknown> | null {
  if (pageKey === "page:home") return template.pages.home as PageDefinition<unknown>
  if (pageKey === "page:shop") return template.pages.shop as PageDefinition<unknown>
  if (pageKey === "page:pdp") return template.pages.pdp as PageDefinition<unknown>

  const flowRoute = FLOW_PAGE_KEY_TO_ROUTE[pageKey]
  if (flowRoute) {
    const shell = template.flowPages?.[flowRoute]?.shell
    return shell
      ? (flowShellDefinitionAsPageDefinition(shell, pageKey) as PageDefinition<unknown>)
      : null
  }

  if (pageKey.startsWith("page:")) {
    const slug = pageKey.slice("page:".length)
    return (template.staticPages[slug] as PageDefinition<unknown>) ?? null
  }

  return null
}
