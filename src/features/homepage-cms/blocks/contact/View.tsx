import type { ContactBlock } from "@/features/homepage-cms/types/block-types"
import { Mail, MapPin, Phone } from "lucide-react"

export function ContactBlockView({
  block,
  company,
}: {
  block: ContactBlock
  company?: { name: string; address: string; phone: string; email: string }
}) {
  const companyName = block.data.companyName || company?.name || ""
  const address = block.data.address || company?.address || ""
  const phone = block.data.phone || company?.phone || ""
  const email = block.data.email || company?.email || ""
  return (
    <section id="contact" className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 space-y-6">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <p className="text-neutral-400">{block.data.description}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <article className="border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold">{companyName}</h3>
            <p className="text-neutral-400 mt-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{address}</p>
            <p className="text-neutral-400 mt-2 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />{phone}</p>
            <p className="text-neutral-400 mt-2 flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />{email}</p>
          </article>
        </div>
      </div>
    </section>
  )
}
