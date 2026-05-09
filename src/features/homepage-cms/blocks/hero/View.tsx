import type { HeroBlock } from "@/features/homepage-cms/types/block-types"
import Link from "next/link"
import { FallbackImage } from "@/components/common/FallbackImage"

export function HeroBlockView({ block }: { block: HeroBlock }) {
  return (
    <section className="py-28 border-b border-white/10">
      <div className="container mx-auto px-4 text-center space-y-6">
        <div className="relative w-full h-64 border border-white/10 bg-black/20">
          <FallbackImage src={block.data.heroImage} alt={block.data.title} fill className="object-cover" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white">{block.data.title}</h1>
        <p className="text-neutral-300 max-w-2xl mx-auto">{block.data.description}</p>
        <div className="flex items-center justify-center gap-3">
          <Link href={block.data.primaryCtaHref || "/shop"} className="px-4 py-2 bg-primary text-white text-sm">
            {block.data.primaryCtaLabel}
          </Link>
          <Link href={block.data.secondaryCtaHref || "#about"} className="px-4 py-2 border border-white/20 text-white text-sm">
            {block.data.secondaryCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
