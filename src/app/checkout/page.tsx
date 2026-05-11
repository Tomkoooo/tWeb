import { TemplateService } from "@/services/template"
import { FlowRoutePageClient } from "@/components/flow-routes/FlowRoutePageClient"

export default async function CheckoutPage() {
  const template = await TemplateService.getActive()
  return <FlowRoutePageClient templateId={template.manifest.id} flowRoute="checkout" variant="page" />
}
