import { Suspense } from "react"
import { notFound } from "next/navigation"
import { PluginService } from "@/services/plugin"
import { getActiveChrome } from "@/lib/active-chrome"
import { getCampSuccessContent } from "@/lib/camp-page-content"
import { CampSuccessPageClient } from "./CampSuccessPageClient"

export default async function FoglalasSikerPage() {
  const enabled = await PluginService.isEnabled("camp-booking")
  if (!enabled) notFound()

  const chrome = await getActiveChrome()
  const successCopy = await getCampSuccessContent(chrome.template.manifest.id)

  return (
    <main className="minecraft-page min-h-screen flex items-center justify-center px-4 py-16">
      <Suspense fallback={<p>{successCopy.loadingText}</p>}>
        <CampSuccessPageClient copy={successCopy} />
      </Suspense>
    </main>
  )
}
