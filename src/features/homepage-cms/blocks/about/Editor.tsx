"use client"

import type { AboutBlock } from "@/features/homepage-cms/types/block-types"
import { EditableHeading } from "@/features/homepage-cms/components/primitives/EditableHeading"
import { EditableText } from "@/features/homepage-cms/components/primitives/EditableText"

const ICON_OPTIONS = ["Shield", "Hammer", "Users", "Lightbulb", "Star", "Award"]

export function AboutBlockEditor({
  block,
  onPatch,
}: {
  block: AboutBlock
  onPatch: (field: keyof AboutBlock["data"], value: unknown) => void
}) {
  return (
    <section className="py-20 border-b border-white/10 bg-black/20">
      <div className="container mx-auto px-4 space-y-4">
        <EditableHeading value={block.data.title} onChange={(value) => onPatch("title", value)} editMode className="text-3xl text-white font-black" />
        <EditableText value={block.data.paragraph} onChange={(value) => onPatch("paragraph", value)} editMode multiline className="text-neutral-400" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">Lenyílók</p>
        {block.data.accordions.map((item, index) => (
          <div key={`accordion-${index}`} className="grid md:grid-cols-2 gap-2">
            <input value={item.title} onChange={(event) => onPatch("accordions", block.data.accordions.map((current, idx) => (idx === index ? { ...current, title: event.target.value } : current)))} className="h-9 px-2 bg-black border border-white/20 text-sm text-white" placeholder="Cím" />
            <div className="flex gap-2">
              <input value={item.content} onChange={(event) => onPatch("accordions", block.data.accordions.map((current, idx) => (idx === index ? { ...current, content: event.target.value } : current)))} className="flex-1 h-9 px-2 bg-black border border-white/20 text-sm text-white" placeholder="Tartalom" />
              <button type="button" onClick={() => onPatch("accordions", block.data.accordions.filter((_, idx) => idx !== index))} className="px-3 h-9 border border-red-500/60 text-red-200 text-xs uppercase">Törlés</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onPatch("accordions", [...block.data.accordions, { title: "Új lenyíló", content: "Lenyíló tartalom" }])} className="px-3 h-9 border border-white/20 text-white text-xs uppercase">Lenyíló hozzáadása</button>
        <p className="text-xs uppercase tracking-widest text-neutral-400">Kártyák</p>
        {block.data.cards.map((item, index) => (
          <div key={`about-card-${index}`} className="grid md:grid-cols-3 gap-2">
            <input value={item.title} onChange={(event) => onPatch("cards", block.data.cards.map((current, idx) => (idx === index ? { ...current, title: event.target.value } : current)))} className="h-9 px-2 bg-black border border-white/20 text-sm text-white" placeholder="Cím" />
            <input value={item.description} onChange={(event) => onPatch("cards", block.data.cards.map((current, idx) => (idx === index ? { ...current, description: event.target.value } : current)))} className="h-9 px-2 bg-black border border-white/20 text-sm text-white" placeholder="Leírás" />
            <div className="flex gap-2">
              <select value={item.icon ?? ""} onChange={(event) => onPatch("cards", block.data.cards.map((current, idx) => (idx === index ? { ...current, icon: event.target.value || undefined } : current)))} className="flex-1 h-9 px-2 bg-black border border-white/20 text-sm text-white">
                <option value="">Nincs ikon</option>
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <button type="button" onClick={() => onPatch("cards", block.data.cards.filter((_, idx) => idx !== index))} className="px-3 h-9 border border-red-500/60 text-red-200 text-xs uppercase">Törlés</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onPatch("cards", [...block.data.cards, { title: "Új kártya", description: "Kártya leírás", icon: "Shield" }])} className="px-3 h-9 border border-white/20 text-white text-xs uppercase">Kártya hozzáadása</button>
      </div>
    </section>
  )
}
