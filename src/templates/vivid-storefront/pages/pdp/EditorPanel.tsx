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

  const updateTrust = (idx: number, key: "icon" | "label", value: string) =>
    setDraft((d) => ({
      ...d,
      trustItems: d.trustItems.map((it, i) =>
        i === idx
          ? { ...it, [key]: key === "icon" ? (value as PdpContent["trustItems"][number]["icon"]) : value }
          : it
      ),
    }))

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
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={draft.showBreadcrumb}
            onChange={(e) =>
              setDraft((d) => ({ ...d, showBreadcrumb: e.target.checked }))
            }
          />
          <span className="text-sm">Show breadcrumb</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={draft.showTrustStrip}
            onChange={(e) =>
              setDraft((d) => ({ ...d, showTrustStrip: e.target.checked }))
            }
          />
          <span className="text-sm">Show trust strip below product</span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Trust strip items</Label>
          {draft.trustItems.length < 4 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  trustItems: [...d.trustItems, { icon: "shield", label: "" }],
                }))
              }
            >
              Add item
            </Button>
          ) : null}
        </div>
        {draft.trustItems.map((item, idx) => (
          <div key={idx} className="space-y-2 rounded-md border border-white/10 p-4">
            <div className="grid gap-3 md:grid-cols-[160px,1fr]">
              <select
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                value={item.icon}
                onChange={(e) => updateTrust(idx, "icon", e.target.value)}
              >
                <option value="shield">Shield</option>
                <option value="truck">Truck</option>
                <option value="rotate">Rotate</option>
              </select>
              <Input
                value={item.label}
                onChange={(e) => updateTrust(idx, "label", e.target.value)}
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  trustItems: d.trustItems.filter((_, i) => i !== idx),
                }))
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
