import type { RenderProps, HomePageDeps } from "@/templates/types"
import { CampaignLanding } from "../components/CampaignLanding"
import { KeramiaRoot } from "../components/KeramiaRoot"
import { KERAMIA_ADDRESS, KERAMIA_EMAIL, KERAMIA_PHONE } from "../lib/constants"
import type { CampaignPageContent } from "../static-pages/shared/schema"

export function CampaignHomeRender({
  content,
  deps,
}: RenderProps<CampaignPageContent, HomePageDeps>) {
  const emails =
    deps.siteContact.emails.length > 0
      ? deps.siteContact.emails
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
