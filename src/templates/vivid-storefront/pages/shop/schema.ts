import { z } from "zod"

export const shopSchema = z.object({
  heading: z.string().default("The catalog"),
  eyebrow: z.string().default("Shop"),
  subheading: z.string().default(""),
  productGridColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  pageSize: z.number().int().min(4).max(48).default(12),
  emptyStateMessage: z.string().default("Nothing matches those filters yet."),
  meta: z
    .object({
      seoTitle: z.string().default(""),
      seoDescription: z.string().default(""),
    })
    .default({ seoTitle: "", seoDescription: "" }),
})

export type ShopContent = z.infer<typeof shopSchema>
