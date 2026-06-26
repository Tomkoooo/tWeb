import type { KeramiaCampaignSlug } from "../../../lib/constants"
import type { CampaignPageContent } from "../schema"
import { fogfeheritesDefault } from "./fogfeherites"
import { implantDefault } from "./implant"
import { newpatientDefault } from "./newpatient"

export const KERAMIA_CAMPAIGN_DEFAULTS: Record<KeramiaCampaignSlug, CampaignPageContent> = {
  fogfeherites: fogfeheritesDefault,
  implant: implantDefault,
  newpatient: newpatientDefault,
}
