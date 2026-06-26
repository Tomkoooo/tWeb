import type { RenderProps, StaticPageDeps } from "@/templates/types"
import { CampaignLanding } from "../../components/CampaignLanding"
import { KeramiaRoot } from "../../components/KeramiaRoot"
import { KERAMIA_ADDRESS, KERAMIA_EMAIL, KERAMIA_PHONE } from "../../lib/constants"
import type { CampaignPageContent } from "./schema"

export function CampaignPageRender({
  content,
  deps,
}: RenderProps<CampaignPageContent, StaticPageDeps>) {
  const emails =
    deps.contactEmails && deps.contactEmails.length > 0
      ? deps.contactEmails
      : [{ id: "default", label: "Fogászat", email: KERAMIA_EMAIL }]

  return (
    <KeramiaRoot>
      <CampaignLanding
        content={content}
        siteContact={{
          emails,
          phone: KERAMIA_PHONE,
          address: KERAMIA_ADDRESS,
        }}
      />
    </KeramiaRoot>
  )
}
