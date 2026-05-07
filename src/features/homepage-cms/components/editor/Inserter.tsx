"use client"

import { getAllDefinitions } from "@/features/homepage-cms/registry/block-registry"
import type { HomepageBlockType } from "@/features/homepage-cms/types/block-types"

export function Inserter({ onInsert }: { onInsert: (type: HomepageBlockType) => void }) {
  const definitions = getAllDefinitions()
  return (
    <div className="border border-dashed border-white/20 p-3 bg-black/50">
      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Blokk könyvtár</p>
      <div className="flex flex-wrap gap-2">
        {definitions.map((definition) => (
          <button
            key={definition.type}
            type="button"
            onClick={() => onInsert(definition.type)}
            className="px-2 h-7 border border-white/20 text-[10px] uppercase text-white hover:border-primary"
          >
            {definition.label}
          </button>
        ))}
      </div>
    </div>
  )
}
