"use client"

import { useState } from "react"

type Accordion = { title: string; content: string }

export function MineshowFaq({ title, items }: { title: string; items: Accordion[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-[#b8d88a] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-minecraft text-[#78B7FF] text-lg mb-6 drop-shadow-[2px_2px_0_#1a3d5c]">
          {title}
        </h2>
        <ul className="space-y-3">
          {items.map((item, i) => {
            const open = openIndex === i
            return (
              <li key={i}>
                <button
                  type="button"
                  className="minecraft-faq-item w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                  data-open={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className="font-minecraft text-[10px] text-white leading-relaxed">
                    {item.title}
                  </span>
                  <span className="font-minecraft text-white shrink-0">{open ? "−" : "+"}</span>
                </button>
                {open ? (
                  <div className="minecraft-panel-inner mt-1 p-4 font-minecraft text-[10px] text-[#3d2817] leading-relaxed">
                    {item.content}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
