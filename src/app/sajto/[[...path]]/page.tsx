import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PluginService } from "@/services/plugin"
import { BrandingSettingsService } from "@/services/branding-settings"
import { PressPortalClient } from "@/plugins/press-kit/storefront/PressPortalClient"
import { getPluginConfigForDeployment } from "@/config/deployments-registry"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Sajtóanyagok",
}

type Props = { params: Promise<{ path?: string[] }> }

export default async function SajtoPage({ params }: Props) {
  const enabled = await PluginService.isEnabled("press-kit")
  if (!enabled) notFound()

  const { path = [] } = await params
  const tokenFromUrl = path[0]
  const host = await PluginService.getHost()
  const pluginConfig = getPluginConfigForDeployment("press-kit", host)
  const portalTitle = String(pluginConfig.portalTitle || "Sajtóanyagok")
  const branding = await BrandingSettingsService.get()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <span className="font-semibold tracking-tight">{branding.brandName}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {portalTitle}
          </span>
        </div>
      </header>
      <PressPortalClient tokenFromUrl={tokenFromUrl} portalTitle={portalTitle} />
    </div>
  )
}
