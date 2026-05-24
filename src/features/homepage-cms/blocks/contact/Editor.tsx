"use client"

import Link from "next/link"
import type { ContactBlock } from "@/features/homepage-cms/types/block-types"
import { EditableHeading } from "@/features/homepage-cms/components/primitives/EditableHeading"
import { EditableText } from "@/features/homepage-cms/components/primitives/EditableText"

export function ContactBlockEditor({
  block,
  onPatch,
}: {
  block: ContactBlock
  onPatch: (field: keyof ContactBlock["data"], value: unknown) => void
}) {
  return (
    <section id="contact" className="py-20 border-b border-white/10 bg-black/20">
      <div className="container mx-auto px-4 space-y-4">
        <EditableHeading value={block.data.title} onChange={(value) => onPatch("title", value)} editMode className="text-3xl text-white font-black" />
        <EditableText value={block.data.description} onChange={(value) => onPatch("description", value)} editMode multiline className="text-neutral-400" />
        <p className="text-xs text-violet-200/90 border border-violet-500/30 bg-violet-500/10 px-3 py-2">
          E-mail címek csak az adminban:{" "}
          <Link href="/admin/cms/settings?section=contact" className="underline font-bold">
            CMS → Kapcsolat e-mailek
          </Link>
          . Itt csak telefon és cím szerkeszthető (opcionális felülírás).
        </p>
        <div className="grid md:grid-cols-2 gap-2">
          <input value={block.data.companyName} onChange={(event) => onPatch("companyName", event.target.value)} className="h-9 px-2 bg-black border border-white/20 text-sm text-white" placeholder="Cégnév" />
          <input value={block.data.address} onChange={(event) => onPatch("address", event.target.value)} className="h-9 px-2 bg-black border border-white/20 text-sm text-white" placeholder="Cím (üres = bolt alapértelmezett)" />
          <input value={block.data.phone} onChange={(event) => onPatch("phone", event.target.value)} className="h-9 px-2 bg-black border border-white/20 text-sm text-white md:col-span-2" placeholder="Telefonszám (üres = bolt alapértelmezett)" />
        </div>
      </div>
    </section>
  )
}
