import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { FallbackImage } from "@/components/common/FallbackImage"
import { cn } from "@/lib/utils"
import type { HomeContent } from "../schema"

type Props = {
  collections: HomeContent["collections"]
  accentClasses: Record<HomeContent["collections"][number]["accentColor"], string>
}

export function CollectionsBlock({ collections, accentClasses }: Props) {
  if (collections.length === 0) return null
  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {collections.map((collection, idx) => (
            <Link
              key={`${collection.title}-${idx}`}
              href={collection.href}
              className="group relative block overflow-hidden rounded-[2rem] ring-1 ring-border transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className={cn("aspect-[4/5] w-full", accentClasses[collection.accentColor])}>
                {collection.image ? (
                  <FallbackImage
                    src={collection.image}
                    alt={collection.title}
                    width={600}
                    height={750}
                    className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                  />
                ) : null}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-secondary/95 via-secondary/60 to-transparent p-6 text-secondary-foreground">
                <div className="space-y-1">
                  <p className="font-serif text-2xl font-black">{collection.title}</p>
                  <p className="max-w-xs text-sm text-white/80">
                    {collection.description}
                  </p>
                </div>
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground transition group-hover:rotate-45">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
