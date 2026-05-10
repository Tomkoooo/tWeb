"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSurfaceDocEdit } from "@/features/template-cms/surface-doc-edit-context"

export function EditableDocText({
  path,
  value,
  className,
  multiline = false,
  placeholder = "…",
}: {
  path: string
  value: string
  className?: string
  multiline?: boolean
  placeholder?: string
}) {
  const cms = useSurfaceDocEdit()
  const [local, setLocal] = useState(value ?? "")

  useEffect(() => {
    setLocal(value ?? "")
  }, [value])

  if (!cms.enabled) {
    return <span className={className}>{value || (multiline ? "" : null)}</span>
  }

  if (multiline) {
    return (
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => cms.setPath(path, local)}
        placeholder={placeholder}
        className={cn(
          "w-full min-h-[72px] rounded border border-dashed border-white/25 bg-black/35 px-2 py-1.5 text-inherit",
          className
        )}
      />
    )
  }

  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => cms.setPath(path, local)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded border border-dashed border-white/25 bg-black/35 px-2 py-1 text-inherit",
        className
      )}
    />
  )
}
