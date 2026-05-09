import { z } from "zod"

export const homeSchema = z.object({
  hero: z.object({
    eyebrow: z.string().default(""),
    headline: z.string().default(""),
    body: z.string().default(""),
    ctaLabel: z.string().default(""),
    ctaHref: z.string().default("/shop"),
    image: z.string().default(""),
  }),
  pillars: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
      })
    )
    .max(6)
    .default([]),
  featured: z.object({
    headline: z.string().default("Featured products"),
    description: z.string().default(""),
    showProductGrid: z.boolean().default(true),
    productLimit: z.number().int().min(1).max(12).default(6),
  }),
  closing: z.object({
    headline: z.string().default(""),
    body: z.string().default(""),
  }),
  meta: z
    .object({
      seoTitle: z.string().default(""),
      seoDescription: z.string().default(""),
    })
    .default({ seoTitle: "", seoDescription: "" }),
})

export type HomeContent = z.infer<typeof homeSchema>
