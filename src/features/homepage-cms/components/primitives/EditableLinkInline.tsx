"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import type { HomepageBlock } from "@/features/homepage-cms/types/block-types"
import { Button } from "@/components/ui/button"

export function EditableLinkInline({
  blockType,
  blockId,
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
  blockId?: string
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
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)
  const [nextHref, setNextHref] = useState(href || "")
  const [nextLabel, setNextLabel] = useState(label || "")

  useEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return
      setPanelPos({ top: rect.bottom + 8, left: rect.left })
    }
    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open])

  if (!cms.enabled) {
    return (
      <Link href={href || "#"} className={className}>
        <Button variant={buttonVariant}>{label}</Button>
      </Link>
    )
  }

  const panel =
    open && panelPos
      ? createPortal(
          <div
            className="cms-admin-control fixed z-[500] w-72 rounded-md border border-white/15 bg-neutral-900 p-3 shadow-xl space-y-2"
            style={{ top: panelPos.top, left: panelPos.left }}
          >
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">Link settings</p>
            <input
              value={nextLabel}
              onChange={(event) => setNextLabel(event.target.value)}
              onBlur={() =>
                onCommitLabel
                  ? onCommitLabel(nextLabel)
                  : cms.updateField(blockType, labelField, nextLabel, blockId)
              }
              className="w-full h-8 px-2 bg-neutral-800 border border-white/20 text-xs text-white"
              placeholder="Button label"
            />
            <input
              value={nextHref}
              onChange={(event) => setNextHref(event.target.value)}
              onBlur={() =>
                onCommitHref
                  ? onCommitHref(nextHref)
                  : cms.updateField(blockType, hrefField, nextHref, blockId)
              }
              className="w-full h-8 px-2 bg-neutral-800 border border-white/20 text-xs text-white"
              placeholder="/shop"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full h-8 border border-white/20 text-xs uppercase text-white"
            >
              Done
            </button>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div ref={anchorRef} className="relative inline-block">
        <Button
          variant={buttonVariant}
          className={className}
          onClick={(event) => {
            event.preventDefault()
            if (!open) {
              setNextLabel(label || "")
              setNextHref(href || "")
            }
            setOpen((prev) => !prev)
          }}
        >
          {label || "Button"}
        </Button>
      </div>
      {panel}
    </>
  )
}
