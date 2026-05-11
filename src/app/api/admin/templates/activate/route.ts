import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { TEMPLATE_PREVIEW_COOKIE } from "@/services/template-preview"
import { TemplateService } from "@/services/template"

const activateBodySchema = z.object({
  templateId: z.string().min(1),
})

export async function POST(request: Request) {
  const session = await requireAdmin()
  const body = activateBodySchema.parse(await request.json())

  const template = await TemplateService.activate(body.templateId, session.user?.email ?? undefined)

  revalidatePath("/", "layout")

  const response = NextResponse.json({
    ok: true,
    templateId: template.manifest.id,
    templateVersion: template.manifest.version,
  })
  // Preview overrides `ActiveTemplate` for admins; clear it so the storefront
  // matches the newly activated template without requiring "Előnézet kikapcsolása".
  response.cookies.delete(TEMPLATE_PREVIEW_COOKIE)
  return response
}
