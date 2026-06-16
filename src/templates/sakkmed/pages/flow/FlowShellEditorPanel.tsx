"use client"

import { useState } from "react"
import type { EditorProps } from "@/templates/types"
import type { DefaultModernFlowShellContent } from "./flow-shell-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function DefaultModernFlowShellEditorPanel({ content, onSave }: EditorProps<unknown>) {
  const [draft, setDraft] = useState(content as DefaultModernFlowShellContent)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(draft)
      toast.success("Mentve")
    } catch (error) {
      toast.error("Mentés sikertelen")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cím</Label>
        <Input value={draft.headline} onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Alcím</Label>
        <textarea
          className="w-full min-h-20 rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
          value={draft.subhead ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, subhead: e.target.value || undefined }))}
        />
      </div>
      <Button type="button" disabled={saving} onClick={() => void handleSave()}>
        Mentés
      </Button>
    </div>
  )
}
