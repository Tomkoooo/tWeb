import Link from "next/link"
import type { CtaBlock } from "@/features/homepage-cms/types/block-types"

export function CtaBlockView({ block }: { block: CtaBlock }) {
  return (
    <section className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 text-center space-y-4">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <p className="text-neutral-400">{block.data.description}</p>
        <div className="flex justify-center gap-3">
          <Link href={block.data.primaryHref} className="px-4 py-2 bg-primary text-white text-sm">{block.data.primaryLabel}</Link>
          <Link href={block.data.secondaryHref} className="px-4 py-2 border border-white/20 text-white text-sm">{block.data.secondaryLabel}</Link>
        </div>
      </div>
    </section>
  )
}
