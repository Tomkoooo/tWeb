import type { DividerBlock } from "@/features/homepage-cms/types/block-types"

export function DividerBlockView({ block }: { block: DividerBlock }) {
  return (
    <section className="py-8 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="h-px bg-white/10" />
        {block.data.label ? <p className="mt-3 text-xs text-neutral-500 uppercase tracking-widest">{block.data.label}</p> : null}
      </div>
    </section>
  )
}
