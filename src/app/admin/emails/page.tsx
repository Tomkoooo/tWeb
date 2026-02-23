import { EmailTemplateService } from "@/services/email-template"
import { Mail, Edit2, Info, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { seedEmailTemplates } from "@/actions/admin-emails"

export default async function AdminEmails() {
  const templates = await EmailTemplateService.getAll()

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            Email <span className="text-accent underline decoration-accent/10 underline-offset-8">Sablonok</span>
          </h1>
          <p className="text-white/40 font-medium italic">Szabja testre a vásárlóknak küldött automatikus rendszerüzeneteket.</p>
        </div>
        
        {templates.length === 0 ? (
          <form action={seedEmailTemplates}>
            <Button variant="krausz" type="submit" className="h-14 px-8 flex items-center gap-3">
              <RefreshCw className="w-5 h-5" />
              SABLONOK INICIALIZÁLÁSA
            </Button>
          </form>
        ) : (
          <form action={seedEmailTemplates}>
            <Button variant="ghost" type="submit" className="text-neutral-500 hover:text-white hover:bg-white/5 uppercase tracking-widest text-[10px] font-black gap-2">
              <RefreshCw className="w-4 h-4" />
              SABLONOK VISSZAÁLLÍTÁSA
            </Button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {templates.length === 0 ? (
          <div className="col-span-full bg-white/5 border border-white/10 p-12 text-center space-y-4">
            <Mail className="w-12 h-12 text-neutral-700 mx-auto" />
            <p className="text-white/20 italic font-medium">Még nincsenek sablonok az adatbázisban. Kattintson az inicializálásra!</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.type} className="group bg-white/5 border border-white/10 p-8 space-y-6 hover:border-accent/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/20 flex items-center justify-center border border-accent/20 transition-transform group-hover:scale-110">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-xl text-white uppercase italic tracking-wider leading-none mb-1">
                      {template.type === 'order_confirmation' ? 'Rendelés visszaigazolása' : 
                       template.type === 'order_status_change' ? 'Rendelés állapot változás' : 
                       template.type.replace('_', ' ')}
                    </h3>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">
                      {template.type}
                    </p>
                  </div>
                </div>
                <Link href={`/admin/emails/${template.type}`}>
                  <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent hover:border-white/10 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-medium leading-relaxed">
                  {template.description || 'Nincs leírás megadva.'}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable: string) => (
                    <span key={variable} className="px-3 py-1 bg-black border border-white/5 text-[9px] font-black text-neutral-600 uppercase tracking-widest">
                      {"{{"}{variable}{"}}"}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  JELENLEGI TÁRGY:
                </p>
                <p className="text-sm font-bold text-white truncate italic">
                  {template.subject}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
