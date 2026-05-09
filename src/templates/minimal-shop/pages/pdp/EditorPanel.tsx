"use client"

import { useState } from "react"
import type { EditorProps } from "@/templates/types"
import type { PdpContent } from "./schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function PdpEditorPanel({ content, onSave }: EditorProps<PdpContent>) {
  const [draft, setDraft] = useState<PdpContent>(content)
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof PdpContent>(key: K, value: PdpContent[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(draft)
      toast.success("Product page saved")
    } catch (error) {
      console.error(error)
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Add to cart label</Label>
          <Input
            value={draft.ctaLabel}
            onChange={(e) => update("ctaLabel", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Out of stock label</Label>
          <Input
            value={draft.outOfStockLabel}
            onChange={(e) => update("outOfStockLabel", e.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={draft.showRelatedProducts}
          onChange={(e) => update("showRelatedProducts", e.target.checked)}
        />
        <span className="text-sm">Show related products</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={draft.showRecentlyViewed}
          onChange={(e) => update("showRecentlyViewed", e.target.checked)}
        />
        <span className="text-sm">Show recently viewed</span>
      </label>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
