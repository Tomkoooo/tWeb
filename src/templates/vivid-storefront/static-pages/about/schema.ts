import { z } from "zod"

export const aboutSchema = z.object({
  hero: z.object({
    eyebrow: z.string().default("Our story"),
    title: z.string().default("Built by makers, for makers"),
    body: z.string().default(""),
    image: z.string().default(""),
  }),
  pillars: z
    .array(
      z.object({
        number: z.string(),
        title: z.string(),
        body: z.string(),
      })
    )
    .max(6)
    .default([]),
  storySections: z
    .array(
      z.object({
        heading: z.string(),
        body: z.string(),
        image: z.string().default(""),
      })
    )
    .max(6)
    .default([]),
  team: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        bio: z.string().default(""),
        photo: z.string().default(""),
      })
    )
    .max(12)
    .default([]),
  cta: z.object({
    eyebrow: z.string().default("Get in touch"),
    title: z.string().default(""),
    label: z.string().default("Contact us"),
    href: z.string().default("/#contact"),
  }),
  meta: z
    .object({
      seoTitle: z.string().default(""),
      seoDescription: z.string().default(""),
    })
    .default({ seoTitle: "", seoDescription: "" }),
})

export type AboutContent = z.infer<typeof aboutSchema>
