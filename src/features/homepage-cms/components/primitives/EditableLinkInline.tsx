"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import type { HomepageBlock } from "@/features/homepage-cms/types/block-types"
import { Button } from "@/components/ui/button"

export function EditableLinkInline({
  blockType,
  labelField,
  hrefField,
  label,
  href,
  className,
  buttonVariant = "default",
  onCommitLabel,
  onCommitHref,
}: {
  blockType: HomepageBlock["type"]
  labelField: string
  hrefField: string
  label: string
  href: string
  className?: string
  buttonVariant?: "default" | "outline"
  onCommitLabel?: (value: string) => void
  onCommitHref?: (value: string) => void
}) {
  const cms = useCmsEdit()
  const [open, setOpen] = useState(false)
  const [nextHref, setNextHref] = useState(href || "")
  const [nextLabel, setNextLabel] = useState(label || "")

  useEffect(() => {
    setNextHref(href || "")
  }, [href])
  useEffect(() => {
    setNextLabel(label || "")
  }, [label])

  if (!cms.enabled) {
    return (
      <Link href={href || "#"} className={className}>
        <Button variant={buttonVariant}>{label}</Button>
      </Link>
    )
  }

  return (
    <div className="relative inline-block">
      <Button
        variant={buttonVariant}
        className={className}
        onClick={(event) => {
          event.preventDefault()
          setOpen((prev) => !prev)
        }}
      >
        {label || "Button"}
      </Button>
      {open ? (
        <div className="absolute z-50 mt-2 w-72 rounded-md border border-white/15 bg-black/95 p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400">Link settings</p>
          <input
            value={nextLabel}
            onChange={(event) => setNextLabel(event.target.value)}
            onBlur={() =>
              onCommitLabel ? onCommitLabel(nextLabel) : cms.updateField(blockType, labelField, nextLabel)
            }
            className="w-full h-8 px-2 bg-black border border-white/20 text-xs text-white"
            placeholder="Button label"
          />
          <input
            value={nextHref}
            onChange={(event) => setNextHref(event.target.value)}
            onBlur={() =>
              onCommitHref ? onCommitHref(nextHref) : cms.updateField(blockType, hrefField, nextHref)
            }
            className="w-full h-8 px-2 bg-black border border-white/20 text-xs text-white"
            placeholder="/shop"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full h-8 border border-white/20 text-xs uppercase text-white"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  )
}

