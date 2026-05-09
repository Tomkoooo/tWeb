import { z } from "zod"

export const pdpSchema = z.object({
  ctaLabel: z.string().default("Add to bag"),
  outOfStockLabel: z.string().default("Sold out"),
  showRelatedProducts: z.boolean().default(true),
  showRecentlyViewed: z.boolean().default(false),
})

export type PdpContent = z.infer<typeof pdpSchema>
