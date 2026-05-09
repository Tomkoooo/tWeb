import { pdpSchema, type PdpContent } from "./schema"

export const pdpDefaultContent: PdpContent = pdpSchema.parse({
  showBreadcrumb: true,
  showTrustStrip: true,
  trustItems: [
    { icon: "truck", label: "Free shipping over 25 000 HUF" },
    { icon: "rotate", label: "30-day no-questions returns" },
    { icon: "shield", label: "2-year guarantee on every order" },
  ],
})
