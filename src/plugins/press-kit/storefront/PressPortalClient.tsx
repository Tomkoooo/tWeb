"use client"

import { useCallback, useEffect, useState } from "react"
import { PressGate } from "./PressGate"
import { PressPdfViewer } from "./PressPdfViewer"
import { PressKitPageRender } from "./PressKitPageRender"
import { pressPortalApi, type PressContentResponse } from "./press-api-client"
import { Button } from "@/components/ui/button"
import { trackPressEvent } from "@/lib/analytics/track"
import {
  normalizePressKitPageContent,
  normalizePressKitPageContentBlocks,
  type PressKitPageContent,
} from "../lib/page-content"
import type { IPressKitSettings } from "../models/PressKitSettings"

type Props = {
  tokenFromUrl?: string
  portalTitle: string
}

function resolvePageContent(data: PressContentResponse): PressKitPageContent {
  if (data.content.pageContent?.blocks?.length) {
    return {
      blocks: normalizePressKitPageContentBlocks(
        data.content.pageContent.blocks as PressKitPageContent["blocks"]
      ),
    }
  }
  return normalizePressKitPageContent({
    pageTitle: data.content.pageTitle,
    heroImage: data.content.heroImage,
    embargoNote: data.content.embargoNote,
    sections: data.content.sections,
    productHighlights: data.content.productHighlights,
  } as Pick<
    IPressKitSettings,
    "pageTitle" | "heroImage" | "embargoNote" | "sections" | "productHighlights"
  >)
}

export function PressPortalClient({ tokenFromUrl, portalTitle }: Props) {
  const [accessMode, setAccessMode] = useState<string>("unique_link")
  const [authenticated, setAuthenticated] = useState(false)
  const [content, setContent] = useState<PressContentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSession = useCallback(async () => {
    const [config, session] = await Promise.all([
      pressPortalApi.getPortalConfig(),
      pressPortalApi.getSession(),
    ])
    if (config.ok) setAccessMode(config.accessMode)

    if (!session.ok && config.accessMode === "unique_link" && tokenFromUrl) {
      try {
        await pressPortalApi.auth({ token: tokenFromUrl })
        const retry = await pressPortalApi.getSession()
        if (retry.ok && retry.contact) {
          setAuthenticated(true)
          const data = await pressPortalApi.getContent()
          setContent(data)
          setLoading(false)
          return
        }
      } catch {
        // show gate
      }
    }

    if (session.ok && session.contact) {
      setAuthenticated(true)
      try {
        const data = await pressPortalApi.getContent()
        setContent(data)
        trackPressEvent("press_page_view", {
          press_contact_id: data.contact.id,
          press_outlet: data.contact.outlet,
          press_name: data.contact.name,
          page_section: "portal",
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Tartalom nem elérhető")
        setAuthenticated(false)
      }
    }
    setLoading(false)
  }, [tokenFromUrl])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  async function handleLogout() {
    await pressPortalApi.logout()
    setAuthenticated(false)
    setContent(null)
  }

  if (loading) {
    return <p className="text-center text-muted-foreground py-20">Betöltés…</p>
  }

  if (!authenticated) {
    return (
      <PressGate
        accessMode={accessMode}
        tokenFromUrl={tokenFromUrl}
        portalTitle={portalTitle}
        onSuccess={() => {
          setLoading(true)
          loadSession()
        }}
      />
    )
  }

  if (error || !content) {
    return <p className="text-center text-destructive py-20">{error || "Nincs tartalom"}</p>
  }

  const { contact, watermark } = content
  const pageContent = resolvePageContent(content)
  const page = content.content

  return (
    <div>
      <div className="mx-auto max-w-4xl px-4 pt-6 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
          Kilépés
        </Button>
      </div>
      <p className="mx-auto max-w-4xl px-4 pb-2 text-sm text-muted-foreground">
        {contact.name} · {contact.outlet}
      </p>

      <PressKitPageRender
        content={pageContent}
        previewContact={undefined}
        portalTitle={portalTitle}
      />

      {page.pdfMediaFilename ? (
        <section className="mx-auto max-w-4xl px-4 py-10 space-y-4">
          <h2 className="text-2xl font-semibold">Digitális előnézet</h2>
          <PressPdfViewer
            allowDownload={page.pdfSettings.allowDownload}
            disableTextSelection={page.pdfSettings.disableTextSelection}
            showPageNav={page.pdfSettings.showPageNav}
            watermark={watermark}
            contact={contact}
          />
        </section>
      ) : null}
    </div>
  )
}
