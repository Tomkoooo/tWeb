import { NextResponse } from "next/server"
import { BrandingSettingsService } from "@/services/branding-settings"

export async function GET() {
  const branding = await BrandingSettingsService.get()
  return NextResponse.json(branding)
}
