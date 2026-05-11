import type { GalleryBlock } from "@/features/homepage-cms/types/block-types"
import { FallbackImage } from "@/components/common/FallbackImage"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import { EditableTextInline } from "@/features/homepage-cms/components/primitives/EditableTextInline"

export function GalleryBlockView({ block }: { block: GalleryBlock }) {
  const cms = useCmsEdit()
  return (
    <section id="gallery" className="border-b border-border bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto space-y-6 px-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          {cms.enabled ? (
            <EditableTextInline blockType="gallery" field="title" value={block.data.title} />
          ) : (
            block.data.title
          )}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block.data.items.map((item, idx) => (
            <figure key={idx} className="overflow-hidden rounded-xl border border-border bg-background">
              <FallbackImage
                src={item.image}
                alt={item.caption}
                width={640}
                height={360}
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
