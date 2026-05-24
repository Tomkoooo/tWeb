import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { ContactEmailsService } from "@/services/contact-emails"
import { revalidatePath } from "next/cache"

const entrySchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  email: z.string().email(),
})

const schema = z.object({
  entries: z.array(entrySchema),
})

export async function GET() {
  await requireAdmin()
  return NextResponse.json({ entries: await ContactEmailsService.list() })
}

export async function PUT(request: Request) {
  await requireAdmin()
  const { entries } = schema.parse(await request.json())
  const saved = await ContactEmailsService.save(entries)
  revalidatePath("/", "layout")
  return NextResponse.json({ entries: saved })
}
