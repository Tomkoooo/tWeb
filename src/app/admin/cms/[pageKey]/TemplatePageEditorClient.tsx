"use client"

import { createElement } from "react"
import { useRouter } from "next/navigation"
import { TEMPLATE_REGISTRY } from "@/templates/registry"
import { toast } from "sonner"
import type { ComponentType } from "react"
import type { EditorProps } from "@/templates/types"

type Props = {
  templateId: string
  pageKey: string
  initialContent: unknown
}

function pickEditorPanel(
  templateId: string,
  pageKey: string
): ComponentType<EditorProps<unknown>> | null {
  const template = TEMPLATE_REGISTRY[templateId]
  if (!template) return null
  if (pageKey === "page:home") return template.pages.home.EditorPanel
  if (pageKey === "page:shop") return template.pages.shop.EditorPanel
  if (pageKey === "page:pdp") return template.pages.pdp.EditorPanel
  if (pageKey.startsWith("page:")) {
    const slug = pageKey.slice("page:".length)
    return template.staticPages[slug]?.EditorPanel ?? null
  }
  return null
}

export function TemplatePageEditorClient({
  templateId,
  pageKey,
  initialContent,
}: Props) {
  const router = useRouter()
  const panel = pickEditorPanel(templateId, pageKey)

  const handleSave = async (next: unknown) => {
    const res = await fetch("/api/admin/template-content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId, pageKey, value: next }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      toast.error(body?.error || "Mentés sikertelen")
      throw new Error("save failed")
    }
    router.refresh()
  }

  if (!panel) {
    return (
      <div className="rounded-md border border-white/10 bg-white/5 p-6 text-sm text-neutral-400">
        Nincs szerkesztő panel ehhez az oldalhoz.
      </div>
    )
  }

  return createElement(panel, {
    content: initialContent,
    templateId,
    pageKey,
    onSave: handleSave,
  })
}
