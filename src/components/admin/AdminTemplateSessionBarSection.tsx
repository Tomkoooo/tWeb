import { TemplateService } from "@/services/template"
import { readPreviewTemplateId } from "@/services/template-preview"
import { getTemplateByIdAsync } from "@/templates/registry"
import { AdminTemplateSessionBar } from "@/components/admin/AdminTemplateSessionBar"

/** Server-only wrapper: template DB vs preview bar for CMS / templates admin areas. */
export async function AdminTemplateSessionBarSection() {
  const [activeInfo, previewTemplateId] = await Promise.all([
    TemplateService.getActiveInfo(),
    readPreviewTemplateId(),
  ])
  const [dbActiveTemplate, previewTemplate] = await Promise.all([
    getTemplateByIdAsync(activeInfo.templateId),
    previewTemplateId ? getTemplateByIdAsync(previewTemplateId) : Promise.resolve(null),
  ])
  const dbActiveName = dbActiveTemplate.manifest.name
  const previewTemplateName = previewTemplate?.manifest.name ?? null

  return (
    <AdminTemplateSessionBar
      dbActiveName={dbActiveName}
      previewTemplateId={previewTemplateId}
      previewTemplateName={previewTemplateName}
    />
  )
}
