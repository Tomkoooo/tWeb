import type { AboutBlock } from "@/features/homepage-cms/types/block-types"
import { Award, Hammer, Lightbulb, Shield, Star, Users } from "lucide-react"

const ICON_MAP = { Shield, Hammer, Users, Lightbulb, Star, Award } as const

export function AboutBlockView({ block }: { block: AboutBlock }) {
  return (
    <section id="about" className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 space-y-8">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <p className="text-neutral-400">{block.data.paragraph}</p>
        <div className="space-y-2">
          {block.data.accordions.map((item, index) => (
            <details key={`${item.title}-${index}`} className="border border-white/15 p-3 bg-white/5">
              <summary className="text-white cursor-pointer">{item.title}</summary>
              <p className="text-neutral-400 mt-2">{item.content}</p>
            </details>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {block.data.cards.map((item, index) => {
            const Icon = item.icon && item.icon in ICON_MAP ? ICON_MAP[item.icon as keyof typeof ICON_MAP] : null
            return (
              <article key={`${item.title}-${index}`} className="border border-white/10 bg-white/5 p-4 space-y-2">
                {Icon ? <Icon className="w-5 h-5 text-primary" /> : null}
                <h3 className="text-white font-bold">{item.title}</h3>
                <p className="text-sm text-neutral-400">{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
