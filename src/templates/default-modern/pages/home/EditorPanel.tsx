"use client"

import type { EditorProps } from "@/templates/types"
import type { HomeContent } from "./schema"

// The home page for default-modern uses the existing VisualHomepageEditor at
// /admin/cms. This panel is a thin marker indicating the existing editor is
// the source of truth. A future refactor can mount VisualHomepageEditor here
// directly so all template pages share the same admin shell.

export function HomeEditorPanel(props: EditorProps<HomeContent>) {
  void props
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-6 text-sm text-neutral-400">
      The default-modern home page is edited at <code>/admin/cms</code>.
    </div>
  )
}
