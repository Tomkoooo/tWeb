import { z } from "zod"

export const pdpSchema = z.object({
  showRelatedProducts: z.boolean().default(true),
  showRecentlyViewed: z.boolean().default(false),
  ctaLabel: z.string().default("Kosárba"),
  outOfStockLabel: z.string().default("Elfogyott"),
  galleryStyle: z.enum(["thumbs", "carousel"]).default("thumbs"),
})

export type PdpContent = z.infer<typeof pdpSchema>
