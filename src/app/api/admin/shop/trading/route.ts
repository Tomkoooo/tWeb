import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { ShopTradingSettingsService } from "@/services/shop-trading-settings"
import { z } from "zod"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  shippingAllowedCountryCodes: z.array(z.string()).optional(),
  invoicingAllowedCountryCodes: z.array(z.string()).optional(),
})

export async function GET() {
  await requireAdmin()
  const s = await ShopTradingSettingsService.get()
  return NextResponse.json(s)
}

export async function PUT(req: NextRequest) {
  await requireAdmin()
  const json = await req.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Érvénytelen adat" }, { status: 400 })
  }
  const next = await ShopTradingSettingsService.update({
    shippingAllowedCountryCodes: parsed.data.shippingAllowedCountryCodes,
    invoicingAllowedCountryCodes: parsed.data.invoicingAllowedCountryCodes,
  })
  return NextResponse.json(next)
}
