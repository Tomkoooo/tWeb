import type { Metadata } from "next"
import FlowPageTemplateBridge from "@/components/layout/FlowPageTemplateBridge"
import StorefrontFlowShell from "@/components/layout/StorefrontFlowShell"
import { ProfileChromeLayout } from "@/components/layout/ProfileChromeLayout"
import { TemplateService } from "@/services/template"
import { isShopEnabled } from "@/lib/features/shop"

export const metadata: Metadata = {
  title: "Profil | Krausz",
  description: "Krausz profiloldal és rendelések kezelése",
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const template = await TemplateService.getActive()
  const Chrome = template.flowPages?.profile?.RouteChrome ?? ProfileChromeLayout
  const shopEnabled = isShopEnabled()

  return (
    <StorefrontFlowShell>
      <FlowPageTemplateBridge route="profile">
        <Chrome shopEnabled={shopEnabled}>{children}</Chrome>
      </FlowPageTemplateBridge>
    </StorefrontFlowShell>
  )
}
