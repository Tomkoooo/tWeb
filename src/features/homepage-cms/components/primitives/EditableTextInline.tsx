"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import type { HomepageBlock } from "@/features/homepage-cms/types/block-types"

export function EditableTextInline({
  blockType,
  field,
  value,
  className,
  multiline = false,
  placeholder = "Text",
  onCommit,
}: {
  blockType: HomepageBlock["type"]
  field: string
  value: string
  className?: string
  multiline?: boolean
  placeholder?: string
  /** When set (e.g. hero slides), overrides default top-level `updateField`. */
  onCommit?: (value: string) => void
}) {
  const cms = useCmsEdit()
  const [localValue, setLocalValue] = useState(value || "")

  useEffect(() => {
    setLocalValue(value || "")
  }, [value])

  const commit = () => {
    if (onCommit) onCommit(localValue)
    else cms.updateField(blockType, field, localValue)
  }

  if (!cms.enabled) {
    return <>{value || placeholder}</>
  }

  if (multiline) {
    return (
      <textarea
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        className={cn("w-full border border-dashed border-white/20 bg-black/30 px-2 py-1 text-white", className)}
      />
    )
  }

  return (
    <input
      value={localValue}
      onChange={(event) => setLocalValue(event.target.value)}
      onBlur={commit}
      placeholder={placeholder}
      className={cn("w-full border border-dashed border-white/20 bg-black/30 px-2 py-1 text-white", className)}
    />
  )
}

