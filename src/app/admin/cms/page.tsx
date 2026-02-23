import { ShopContentService } from "@/services/shop-content"
import { updateShopContent } from "@/actions/admin-cms"
import { Save, Mail } from "lucide-react"
import { AccordionEditor } from "@/components/admin/AccordionEditor"
import { CMSForm } from "@/components/admin/CMSForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminCMS() {
  const content = await ShopContentService.getAll()

  const sections = [
    {
      title: "Hero Szekció",
      fields: [
        { key: "hero_title", label: "Hero Cím", type: "text" },
        { key: "hero_description", label: "Hero Leírás", type: "textarea" },
      ]
    },
    {
      title: "Történetünk Szekció",
      fields: [
        { key: "story_title", label: "Történet Cím", type: "text" },
        { key: "story_content", label: "Történet Tartalom", type: "textarea" },
        { key: "story_accordions", label: "Accordions", type: "accordion" },
      ]
    },
    {
      title: "Kapcsolati Adatok",
      fields: [
        { key: "contact_email", label: "Email Cím", type: "text" },
        { key: "contact_phone", label: "Telefonszám", type: "text" },
        { key: "contact_address", label: "Cím", type: "text" },
      ]
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-40">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            Tartalom <span className="text-accent underline decoration-accent/10 underline-offset-8">Kezelés</span>
          </h1>
          <p className="text-white/40 font-medium italic">Itt szabhatja testre a kezdőlapon megjelenő szövegeket és információkat.</p>
        </div>
        
        <Link href="/admin/emails">
          <Button variant="ghost" className="h-14 px-6 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 uppercase tracking-widest text-[10px] font-black gap-2">
            <Mail className="w-4 h-4 text-accent" />
            EMAIL SABLONOK SZERKESZTÉSE
          </Button>
        </Link>
      </div>

      <CMSForm action={updateShopContent}>
        <div className="grid grid-cols-1 gap-12">
          {sections.map((section) => (
            <div key={section.title} className="bg-white/5 border border-white/10 rounded-none p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-3 text-white">
                <div className="w-1.5 h-6 bg-accent" />
                <h2 className="text-xl font-heading font-black italic uppercase tracking-wider">{section.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.key}
                        defaultValue={content[field.key] || ""}
                        rows={5}
                        className="w-full bg-black border border-white/5 rounded-none p-5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none leading-relaxed"
                        placeholder={`ADJA MEG A KÖVETKEZŐT: ${field.label.toUpperCase()}...`}
                      />
                    ) : field.type === "accordion" ? (
                      <AccordionEditor 
                        name={field.key}
                        initialData={content[field.key]} 
                      />
                    ) : (
                      <input
                        type="text"
                        name={field.key}
                        defaultValue={content[field.key] || ""}
                        className="w-full h-14 bg-black border border-white/5 rounded-none px-5 text-white font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                        placeholder={`ADJA MEG A KÖVETKEZŐT: ${field.label.toUpperCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CMSForm>
    </div>
  )
}

