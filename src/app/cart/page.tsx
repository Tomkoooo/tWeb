import { TemplateService } from "@/services/template"
import { FlowRoutePageClient } from "@/components/flow-routes/FlowRoutePageClient"

export default async function CartPage() {
  const template = await TemplateService.getActive()
  return <FlowRoutePageClient templateId={template.manifest.id} flowRoute="cart" variant="page" />
}
