import type { RichTextBlock } from "@/features/homepage-cms/types/block-types"

export function RichTextBlockView({ block }: { block: RichTextBlock }) {
  return (
    <section className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 space-y-4">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: block.data.html }}
        />
      </div>
    </section>
  )
}
