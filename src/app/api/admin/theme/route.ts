import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { ThemeService } from "@/services/theme"
import { revalidatePath } from "next/cache"

const hex = z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)

const themeSchema = z.object({
  primary: hex,
  primaryForeground: hex,
  secondary: hex,
  secondaryForeground: hex,
  accent: hex,
  accentForeground: hex,
  background: hex,
  foreground: hex,
  surface: hex,
  surfaceForeground: hex,
  border: hex,
  muted: hex,
  mutedForeground: hex,
  success: hex,
  successForeground: hex,
  warning: hex,
  warningForeground: hex,
  error: hex,
  errorForeground: hex,
})

export async function GET() {
  await requireAdmin()
  return NextResponse.json(await ThemeService.get())
}

export async function PUT(request: Request) {
  await requireAdmin()
  const payload = themeSchema.parse(await request.json())
  const updated = await ThemeService.update(payload)
  revalidatePath("/", "layout")
  return NextResponse.json(updated)
}
