import type { TestimonialsBlock } from "@/features/homepage-cms/types/block-types"

export function TestimonialsBlockView({ block }: { block: TestimonialsBlock }) {
  return (
    <section className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 space-y-6">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <p className="text-neutral-400">{block.data.subtitle}</p>
        <div className="grid md:grid-cols-2 gap-4">
          {block.data.items.map((item, idx) => (
            <article key={idx} className="border border-white/10 bg-white/5 p-4">
              <p className="text-white">&ldquo;{item.quote}&rdquo;</p>
              <p className="text-neutral-400 text-sm mt-2">{item.name} - {item.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
