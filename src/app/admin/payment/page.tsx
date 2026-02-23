import * as React from "react"
import dbConnect from "@/lib/db"
import PaymentMethod from "@/models/PaymentMethod"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  deletePaymentMethod, 
  createPaymentMethod, 
  updatePaymentMethod 
} from "@/actions/admin-checkout"
import { MethodDialog } from "@/components/admin/MethodDialog"

export default async function AdminPaymentPage() {
  await dbConnect()
  const methods = await PaymentMethod.find({}).lean()

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            FIZETÉSI <span className="text-[#FF5500] underline decoration-[#FF5500]/10 underline-offset-8">MÓDOK</span>
          </h1>
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Pénztárban választható fizetési lehetőségek kezelése</p>
        </div>
        <MethodDialog 
          title="ÚJ FIZETÉSI MÓD" 
          action={createPaymentMethod}
        >
          <Button variant="krausz" className="h-14 px-8 tracking-[0.2em]">
            <Plus className="w-5 h-5" />
            ÚJ HOZZÁADÁSA
          </Button>
        </MethodDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {methods.map((method: any) => (
          <div key={method._id} className="glass-card p-8 border-white/5 space-y-6 group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-heading font-black text-white uppercase italic truncate max-w-[200px]">{method.name}</h3>
                <p className="text-[#FF5500] font-black text-2xl mt-2">{method.grossPrice.toLocaleString("hu-HU")} FT</p>
              </div>
              <div className={cn(
                "px-3 py-1 text-[8px] font-black tracking-widest uppercase",
                method.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {method.isActive ? "AKTÍV" : "INAKTÍV"}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/5">
              <MethodDialog 
                title="MÓD SZERKESZTÉSE" 
                action={updatePaymentMethod.bind(null, method._id.toString())}
                initialData={method}
              >
                <Button variant="outline" className="flex-grow h-12 border-white/10 text-white hover:bg-white/5 rounded-none uppercase tracking-widest text-[10px] font-black">
                  <Edit2 className="w-4 h-4 mr-2" /> SZERKESZTÉS
                </Button>
              </MethodDialog>
              <form action={deletePaymentMethod.bind(null, method._id.toString())}>
                <Button variant="ghost" className="h-12 w-12 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-none">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
