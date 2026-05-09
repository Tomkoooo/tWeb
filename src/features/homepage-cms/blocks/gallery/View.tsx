import type { GalleryBlock } from "@/features/homepage-cms/types/block-types"
import { FallbackImage } from "@/components/common/FallbackImage"

export function GalleryBlockView({ block }: { block: GalleryBlock }) {
  return (
    <section className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 space-y-6">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {block.data.items.map((item, idx) => (
            <figure key={idx} className="space-y-2">
              <FallbackImage src={item.image} alt={item.caption} width={640} height={360} className="w-full h-56 object-cover border border-white/10" />
              <figcaption className="text-sm text-neutral-400">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
