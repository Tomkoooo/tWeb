import { ShopContentService } from "@/services/shop-content"
import { updateShopContent } from "@/actions/admin-cms"
import { Save } from "lucide-react"

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
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase italic text-white">
          Tartalom <span className="text-accent underline decoration-accent/10 underline-offset-8">Kezelés</span>
        </h1>
        <p className="text-white/40 font-medium italic">Itt szabhatja testre a kezdőlapon megjelenő szövegeket és információkat.</p>
      </div>

      <form action={updateShopContent} className="space-y-8">
        <div className="flex justify-end sticky top-8 z-20">
          <button 
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95"
          >
            <Save className="w-5 h-5" />
            Módosítások mentése
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6 italic uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium text-white/60 mb-1.5 block">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.key}
                        defaultValue={content[field.key] || ""}
                        rows={4}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 transition-colors text-white/90"
                        placeholder={`Adja meg a következőt: ${field.label.toLowerCase()}...`}
                      />
                    ) : (
                      <input
                        type="text"
                        name={field.key}
                        defaultValue={content[field.key] || ""}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 transition-colors text-white/90"
                        placeholder={`Adja meg a következőt: ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}

