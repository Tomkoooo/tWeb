import { z } from "zod"

export const pdpSchema = z.object({
  showBreadcrumb: z.boolean().default(true),
  showTrustStrip: z.boolean().default(true),
  trustItems: z
    .array(z.object({ icon: z.enum(["shield", "truck", "rotate"]).default("shield"), label: z.string() }))
    .max(4)
    .default([]),
})

export type PdpContent = z.infer<typeof pdpSchema>
