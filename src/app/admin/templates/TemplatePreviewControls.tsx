"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Props = {
  templateId: string
  isActive: boolean
}

export function TemplatePreviewControls({ templateId, isActive }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [showActivateConfirm, setShowActivateConfirm] = useState(false)

  const setPreview = async () => {
    const res = await fetch("/api/admin/templates/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId }),
    })
    if (!res.ok) {
      toast.error("Nem sikerült beállítani az előnézetet.")
      return
    }
    toast.success(
      "Előnézet aktiválva — csak admin sessionökben látható, max 1 órán át."
    )
    startTransition(() => router.refresh())
  }

  const clearPreview = async () => {
    const res = await fetch("/api/admin/templates/preview", { method: "DELETE" })
    if (!res.ok) {
      toast.error("Nem sikerült törölni az előnézetet.")
      return
    }
    toast.success("Előnézet kikapcsolva.")
    startTransition(() => router.refresh())
  }

  const activate = async () => {
    const res = await fetch("/api/admin/templates/activate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      toast.error(body?.error || "Aktiválás sikertelen.")
      return
    }
    toast.success("Sablon aktiválva. A publikus oldalak frissültek.")
    setShowActivateConfirm(false)
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button
        size="sm"
        variant="outline"
        onClick={setPreview}
        disabled={pending}
      >
        Előnézet
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={clearPreview}
        disabled={pending}
      >
        Előnézet törlése
      </Button>
      {isActive ? (
        <span className="ml-auto text-xs font-semibold uppercase tracking-widest text-green-500">
          Aktív sablon
        </span>
      ) : showActivateConfirm ? (
        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={activate} disabled={pending}>
            Megerősítés
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowActivateConfirm(false)}
            disabled={pending}
          >
            Mégse
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          className="ml-auto"
          onClick={() => setShowActivateConfirm(true)}
          disabled={pending}
        >
          Aktiválás
        </Button>
      )}
    </div>
  )
}
