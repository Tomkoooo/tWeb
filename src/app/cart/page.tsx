import { TemplateService } from "@/services/template"
import { FlowRoutePageClient } from "@/components/flow-routes/FlowRoutePageClient"
import { timeDevMetric } from "@/lib/dev-metrics"

export default async function CartPage() {
  const template = await timeDevMetric("cart.template", () => TemplateService.getActive(), {
    category: "page-data",
    route: "/cart",
  })
  return <FlowRoutePageClient templateId={template.manifest.id} flowRoute="cart" variant="page" />
}
