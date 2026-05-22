import type { ContactBlock } from "@/features/homepage-cms/types/block-types"
import { hasContactFieldValue, resolveContactDisplayField } from "@/lib/contact-display"
import { Mail, MapPin, Phone } from "lucide-react"

export function ContactBlockView({
  block,
  company,
}: {
  block: ContactBlock
  company: { name: string; address: string; phone: string; email: string }
}) {
  const companyName = block.data.companyName || company.name
  const address = resolveContactDisplayField(block.data.address, company.address)
  const phone = resolveContactDisplayField(block.data.phone, company.phone)
  const email = resolveContactDisplayField(block.data.email, company.email)

  return (
    <section id="contact" className="border-b border-border bg-background py-20">
      <div className="container mx-auto space-y-8 px-4">
        <h2 className="text-3xl font-black text-foreground">{block.data.title}</h2>
        <p className="text-muted-foreground">{block.data.description}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="border border-border bg-muted/30 p-4">
            <h3 className="font-bold text-foreground">{companyName}</h3>
            {hasContactFieldValue(address) ? (
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary-foreground" />
                {address}
              </p>
            ) : null}
            {hasContactFieldValue(phone) ? (
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary-foreground" />
                {phone}
              </p>
            ) : null}
            {hasContactFieldValue(email) ? (
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary-foreground" />
                {email}
              </p>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  )
}
