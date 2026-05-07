"use client"

import type { HomepageBlock } from "@/features/homepage-cms/types/block-types"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"

export function EditableListInline<T>({
  blockType,
  field,
  items,
  onRenderItem,
  onCreateItem,
  className,
}: {
  blockType: HomepageBlock["type"]
  field: string
  items: T[]
  onRenderItem: (item: T, index: number, helpers: { remove: () => void }) => React.ReactNode
  onCreateItem: () => T
  className?: string
}) {
  const cms = useCmsEdit()

  return (
    <div className={className}>
      {items.map((item, index) =>
        onRenderItem(item, index, {
          remove: () => cms.updateField(blockType, field, items.filter((_, idx) => idx !== index)),
        })
      )}
      {cms.enabled ? (
        <button
          type="button"
          onClick={() => cms.updateField(blockType, field, [...items, onCreateItem()])}
          className="px-3 h-8 border border-white/20 text-xs uppercase text-white mt-2"
        >
          Add item
        </button>
      ) : null}
    </div>
  )
}

