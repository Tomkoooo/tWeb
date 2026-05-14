import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { shopCommerceBlockedResponse } from "@/lib/features/shop"
import { ProductSuggestionSettingsService } from "@/services/product-suggestion-settings"
import { resolveCheckoutSuggestionItems } from "@/services/checkout-product-suggestions"

const postBodySchema = z.object({
  excludeProductIds: z.array(z.string()).max(200).optional().default([]),
})

export async function POST(request: NextRequest) {
  const blocked = shopCommerceBlockedResponse()
  if (blocked) return blocked

  const json = await request.json().catch(() => ({}))
  const { excludeProductIds } = postBodySchema.parse(json)
  const settings = await ProductSuggestionSettingsService.get()

  if (!settings.enabled || settings.sources.length === 0) {
    return NextResponse.json({
      items: [] as unknown[],
      modalTitle: settings.modalTitle,
      modalHelper: settings.modalHelper,
    })
  }

  const items = await resolveCheckoutSuggestionItems(settings, {
    excludeProductIds: new Set(excludeProductIds),
  })

  return NextResponse.json({
    items,
    modalTitle: settings.modalTitle,
    modalHelper: settings.modalHelper,
  })
}
