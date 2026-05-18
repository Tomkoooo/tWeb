"use client"

import type { GalleryBlock } from "@/features/homepage-cms/types/block-types"
import { EditableHeading } from "@/features/homepage-cms/components/primitives/EditableHeading"
import { EditableImage } from "@/features/homepage-cms/components/primitives/EditableImage"

type Props = {
  block: GalleryBlock
  onPatch: (field: keyof GalleryBlock["data"], value: unknown) => void
}

export function GalleryBlockEditor({ block, onPatch }: Props) {
  const items = Array.isArray(block.data.items) ? block.data.items : []
  return (
    <section className="py-20 border-b border-white/10 bg-black/20">
      <div className="container mx-auto px-4 space-y-4">
        <EditableHeading value={block.data.title} onChange={(value) => onPatch("title", value)} editMode className="text-3xl text-white font-black" />
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`gallery-item-${index}`} className="space-y-2 border border-white/10 p-3">
              <EditableImage
                src={item.image}
                alt={item.caption}
                editMode
                flexibleCrop
                onChange={(next) =>
                  onPatch(
                    "items",
                    items.map((current, idx) => (idx === index ? { ...current, image: next } : current))
                  )
                }
                className="w-full h-56 object-cover border border-white/10"
              />
              <div className="flex gap-2">
                <input
                  value={item.caption}
                  onChange={(event) =>
                    onPatch(
                      "items",
                      items.map((current, idx) => (idx === index ? { ...current, caption: event.target.value } : current))
                    )
                  }
                  className="flex-1 h-9 px-2 bg-black border border-white/20 text-sm text-white"
                  placeholder="Caption"
                />
                <button
                  type="button"
                  onClick={() => onPatch("items", items.filter((_, idx) => idx !== index))}
                  className="px-3 h-9 border border-red-500/60 text-red-200 text-xs uppercase"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onPatch("items", [...items, { image: "/generic-hero.svg", caption: "New image" }])}
            className="px-3 h-9 border border-white/20 text-white text-xs uppercase"
          >
            Add image
          </button>
        </div>
      </div>
    </section>
  )
}
