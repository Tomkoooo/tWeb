import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { HomepageCmsService } from "@/services/homepage-cms"

export async function POST() {
  await requireAdmin()
  const draft = await HomepageCmsService.discardDraft()
  return NextResponse.json({ draft })
}
