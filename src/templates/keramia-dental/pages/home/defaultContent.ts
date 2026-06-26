import type { HomeContent } from "./schema"

/** Empty blocks → `KeramiaCampaignHub` on `/` until CMS content is published. */
export const homeDefaultContent: HomeContent = {
  meta: {
    seoTitle: "Kerámia Dental — Nyári fogászati akciók | Székesfehérvár",
    seoDescription:
      "Fogfehérítés, implantáció és New Patient Special — válasszon kampányt és foglaljon időpontot a Kerámia Dentalnál.",
  },
  blocks: [],
}
