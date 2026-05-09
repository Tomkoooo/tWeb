"use client"

import { useState } from "react"
import type { EditorProps } from "@/templates/types"
import type { ShopContent } from "./schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function ShopEditorPanel({ content, onSave }: EditorProps<ShopContent>) {
  const [draft, setDraft] = useState<ShopContent>(content)
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof ShopContent>(key: K, value: ShopContent[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(draft)
      toast.success("Shop page saved")
    } catch (error) {
      console.error(error)
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Heading</Label>
        <Input
          value={draft.heading}
          onChange={(e) => update("heading", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Subheading</Label>
        <Input
          value={draft.subheading}
          onChange={(e) => update("subheading", e.target.value)}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Grid columns</Label>
          <select
            className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
            value={String(draft.productGridColumns)}
            onChange={(e) =>
              update(
                "productGridColumns",
                Number(e.target.value) as ShopContent["productGridColumns"]
              )
            }
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Page size</Label>
          <Input
            type="number"
            min={4}
            max={48}
            value={draft.pageSize}
            onChange={(e) => update("pageSize", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Empty state message</Label>
        <Input
          value={draft.emptyStateMessage}
          onChange={(e) => update("emptyStateMessage", e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
