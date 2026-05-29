"use client"

import { useRef } from "react"

type Item = { image: string; caption: string }

export function MineshowPrograms({
  title,
  items,
  intro,
}: {
  title: string
  items: Item[]
  intro?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" })
  }

  return (
    <section className="bg-[#b8d88a] px-4 py-12 border-t-4 border-[#3d2817]/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-minecraft text-[#78B7FF] text-lg md:text-xl mb-4 drop-shadow-[2px_2px_0_#1a3d5c]">
          {title}
        </h2>
        {intro ? (
          <p className="font-minecraft text-[10px] md:text-xs text-[#2d2817] mb-8 max-w-4xl whitespace-pre-line leading-relaxed">
            {intro}
          </p>
        ) : null}
        <div className="relative">
          <button
            type="button"
            aria-label="Előző"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center bg-white/90 border-2 border-[#3d2817] font-bold"
            onClick={() => scroll(-1)}
          >
            ‹
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth md:px-12"
          >
            {items.map((item, i) => (
              <figure
                key={`${item.caption}-${i}`}
                className="snap-start shrink-0 w-40 md:w-44 group"
              >
                <div className="minecraft-map-frame aspect-square overflow-hidden bg-[#4e311f] transition-transform group-hover:scale-105">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || "/generic-hero.svg"}
                    alt={item.caption}
                    className="h-full w-full object-cover pixelated"
                  />
                </div>
                <figcaption className="mt-2 font-minecraft text-[8px] text-center text-[#8b2500] drop-shadow-sm">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <button
            type="button"
            aria-label="Következő"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center bg-white/90 border-2 border-[#3d2817] font-bold"
            onClick={() => scroll(1)}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}
