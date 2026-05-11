"use client"

import type { EditorProps } from "@/templates/types"

export function JournalEditorPanel({}: EditorProps<unknown>) {
  return (
    <p className="text-sm text-muted-foreground">
      Edit cards and HTML under <strong>/admin/cms/journal</strong>. Upload images via admin media, then paste URLs into
      cover fields.
    </p>
  )
}
