import type { FeaturesBlock } from "@/features/homepage-cms/types/block-types"
import { Award, Check, Clock3, Heart, Package, Shield, ShieldCheck, Sparkles, Star, ThumbsUp, Truck, Zap } from "lucide-react"

const ICON_MAP = {
  Award,
  Check,
  Clock3,
  Heart,
  Package,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  Zap,
} as const

function normalizeCards(input: unknown): Array<{ title: string; description: string; icon?: string }> {
  if (Array.isArray(input)) {
    return input
      .filter((item): item is { title?: unknown; description?: unknown; icon?: unknown } => Boolean(item && typeof item === "object"))
      .map((item) => ({
        title: String(item.title ?? ""),
        description: String(item.description ?? ""),
        icon: typeof item.icon === "string" ? item.icon : undefined,
      }))
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input)
      return normalizeCards(parsed)
    } catch {
      return []
    }
  }

  return []
}

export function FeaturesBlockView({ block }: { block: FeaturesBlock }) {
  const cards = normalizeCards(block.data.cards)

  return (
    <section className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 space-y-8">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <p className="text-neutral-400">{block.data.subtitle}</p>
        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((card, idx) => (
            <article key={idx} className="border border-white/10 p-4 bg-white/5">
              {card.icon && card.icon in ICON_MAP
                ? (() => {
                    const Icon = ICON_MAP[card.icon as keyof typeof ICON_MAP]
                    return <Icon className="w-5 h-5 text-primary mb-2" />
                  })()
                : null}
              <h3 className="text-white font-bold">{card.title}</h3>
              <p className="text-neutral-400 text-sm mt-2">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
