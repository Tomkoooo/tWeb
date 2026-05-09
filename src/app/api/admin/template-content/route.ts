import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { PageContentService } from "@/services/page-content"
import { TEMPLATE_REGISTRY } from "@/templates/registry"

const saveSchema = z.object({
  templateId: z.string().min(1),
  pageKey: z.string().min(1).max(120),
  value: z.unknown(),
})

const resetSchema = z.object({
  templateId: z.string().min(1),
  pageKey: z.string().min(1).max(120),
})

function pageKeyToPaths(pageKey: string): string[] {
  if (pageKey === "page:home") return ["/"]
  if (pageKey === "page:shop") return ["/shop"]
  if (pageKey === "page:pdp") return ["/products/[slug]"]
  if (pageKey.startsWith("page:")) return [`/${pageKey.slice("page:".length)}`]
  return []
}

export async function PUT(request: Request) {
  const session = await requireAdmin()
  const body = saveSchema.parse(await request.json())

  if (!TEMPLATE_REGISTRY[body.templateId]) {
    return NextResponse.json(
      { ok: false, error: `Unknown template id '${body.templateId}'` },
      { status: 400 }
    )
  }

  try {
    const saved = await PageContentService.save(
      body.templateId,
      body.pageKey,
      body.value,
      session.user?.email ?? undefined
    )
    for (const path of pageKeyToPaths(body.pageKey)) {
      revalidatePath(path, "layout")
    }
    return NextResponse.json({ ok: true, value: saved })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed"
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  await requireAdmin()
  const body = resetSchema.parse(await request.json())
  await PageContentService.reset(body.templateId, body.pageKey)
  for (const path of pageKeyToPaths(body.pageKey)) {
    revalidatePath(path, "layout")
  }
  return NextResponse.json({ ok: true })
}
