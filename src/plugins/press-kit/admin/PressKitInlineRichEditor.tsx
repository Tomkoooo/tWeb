"use client"

import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { useSurfaceDocEdit } from "@/features/template-cms/surface-doc-edit-context"

type Props = {
  path: string
  html: string
  className?: string
  minHeight?: string
}

export function PressKitInlineRichEditor({ path, html, className, minHeight }: Props) {
  const cms = useSurfaceDocEdit()

  if (!cms.enabled) {
    return (
      <div
        className={className ?? "prose prose-neutral dark:prose-invert max-w-none"}
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    )
  }

  return (
    <RichTextEditor
      variant="mail"
      value={html || "<p></p>"}
      onChange={(next) => cms.setPath(path, next)}
      className="border border-dashed border-white/25"
      editorClassName={minHeight ?? "min-h-[200px]"}
    />
  )
}
