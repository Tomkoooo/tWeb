import { TemplateService } from "@/services/template"
import { readPreviewTemplateId } from "@/services/template-preview"
import { getTemplateById } from "@/templates/registry"
import { AdminTemplateSessionBar } from "@/components/admin/AdminTemplateSessionBar"

/** Server-only wrapper: template DB vs preview bar for CMS / templates admin areas. */
export async function AdminTemplateSessionBarSection() {
  const [activeInfo, previewTemplateId] = await Promise.all([
    TemplateService.getActiveInfo(),
    readPreviewTemplateId(),
  ])
  const dbActiveName = getTemplateById(activeInfo.templateId).manifest.name
  const previewTemplateName = previewTemplateId
    ? getTemplateById(previewTemplateId).manifest.name
    : null

  return (
    <AdminTemplateSessionBar
      dbActiveName={dbActiveName}
      previewTemplateId={previewTemplateId}
      previewTemplateName={previewTemplateName}
    />
  )
}
