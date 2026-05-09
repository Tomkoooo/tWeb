import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { TemplateService } from "@/services/template"

const activateBodySchema = z.object({
  templateId: z.string().min(1),
})

export async function POST(request: Request) {
  const session = await requireAdmin()
  const body = activateBodySchema.parse(await request.json())

  const template = await TemplateService.activate(body.templateId, session.user?.email ?? undefined)

  revalidatePath("/", "layout")

  return NextResponse.json({
    ok: true,
    templateId: template.manifest.id,
    templateVersion: template.manifest.version,
  })
}
