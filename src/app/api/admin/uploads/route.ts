import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { MediaService } from "@/services/media"

export async function POST(request: Request) {
  await requireAdmin()
  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 })
  }
  const arrayBuffer = await file.arrayBuffer()
  const filename = await MediaService.processUpload(Buffer.from(arrayBuffer), file.name, file.type)
  await MediaService.incrementUsage(filename)
  return NextResponse.json({ url: `/api/media/${filename}`, mediaId: filename })
}
