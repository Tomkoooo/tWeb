import { EmailTemplateService } from "@/services/email-template"
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor"
import { notFound } from "next/navigation"

export default async function AdminEmailEdit({ params }: { params: { type: string } }) {
  const { type } = await params
  const template = await EmailTemplateService.getByType(type)

  if (!template) {
    notFound()
  }

  return <EmailTemplateEditor template={JSON.parse(JSON.stringify(template))} />
}
