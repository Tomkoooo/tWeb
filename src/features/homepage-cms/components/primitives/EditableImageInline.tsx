"use client"

import { EditableImage } from "@/features/homepage-cms/components/primitives/EditableImage"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import type { HomepageBlock } from "@/features/homepage-cms/types/block-types"

export function EditableImageInline({
  blockType,
  field,
  src,
  alt,
  className,
  width,
  height,
  usageLabel,
}: {
  blockType: HomepageBlock["type"]
  field: string
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  usageLabel?: string
}) {
  const cms = useCmsEdit()
  return (
    <EditableImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      usageLabel={usageLabel}
      editMode={cms.enabled}
      onChange={(next) => cms.updateField(blockType, field, next)}
    />
  )
}

