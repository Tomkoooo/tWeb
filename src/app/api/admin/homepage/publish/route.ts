import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { HomepageCmsService } from "@/services/homepage-cms"

export async function POST() {
  await requireAdmin()
  const published = await HomepageCmsService.publishDraft()
  return NextResponse.json({ published })
}
