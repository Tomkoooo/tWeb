import { z } from "zod"

export const homeSchema = z.object({
  hero: z.object({
    eyebrow: z.string().default(""),
    headline: z.string().default(""),
    headlineAccent: z.string().default(""),
    body: z.string().default(""),
    primaryCtaLabel: z.string().default("Shop now"),
    primaryCtaHref: z.string().default("/shop"),
    secondaryCtaLabel: z.string().default("Our story"),
    secondaryCtaHref: z.string().default("/about"),
    image: z.string().default(""),
    badges: z.array(z.string()).max(6).default([]),
  }),
  collections: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        href: z.string(),
        image: z.string().default(""),
        accentColor: z.enum(["coral", "navy", "purple", "cream"]).default("coral"),
      })
    )
    .max(6)
    .default([]),
  spotlight: z.object({
    enabled: z.boolean().default(true),
    eyebrow: z.string().default("This week's pick"),
    title: z.string().default(""),
    description: z.string().default(""),
    ctaLabel: z.string().default("Shop the spotlight"),
    ctaHref: z.string().default("/shop"),
    image: z.string().default(""),
    productSlug: z.string().default(""),
  }),
  features: z.object({
    title: z.string().default("Why people pick us"),
    items: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
        })
      )
      .max(6)
      .default([]),
  }),
  testimonials: z.object({
    title: z.string().default("Kind words"),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().default(""),
        })
      )
      .max(8)
      .default([]),
  }),
  newsletter: z.object({
    enabled: z.boolean().default(true),
    title: z.string().default("Stay in touch"),
    body: z.string().default(""),
    buttonLabel: z.string().default("Subscribe"),
    placeholder: z.string().default("you@example.com"),
  }),
  meta: z
    .object({
      seoTitle: z.string().default(""),
      seoDescription: z.string().default(""),
    })
    .default({ seoTitle: "", seoDescription: "" }),
})

export type HomeContent = z.infer<typeof homeSchema>
