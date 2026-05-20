import { NextRequest, NextResponse } from "next/server"
import { MediaService } from "@/services/media"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const payload = await MediaService.getFilePayload(filename)

  if (!payload) {
    return new NextResponse("File not found", { status: 404 })
  }

  return new NextResponse(new Uint8Array(payload.buffer), {
    headers: {
      "Content-Type": payload.mimeType,
      "Content-Length": String(payload.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
