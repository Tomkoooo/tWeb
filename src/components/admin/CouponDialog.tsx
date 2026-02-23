"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface CouponDialogProps {
  children: React.ReactNode
  title: string
  action: (data: any) => Promise<void>
}

export function CouponDialog({ children, title, action }: CouponDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<"percentage" | "fixed" | "free_shipping">("percentage")
  const [isActive, setIsActive] = React.useState(true)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      code: (formData.get("code") as string).toUpperCase(),
      type,
      value: type === "free_shipping" ? 0 : parseFloat(formData.get("value") as string),
      minCartValue: parseFloat(formData.get("minCartValue") as string) || 0,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      maxUses: parseInt(formData.get("maxUses") as string) || null,
      isActive
    }

    await action(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-black border-white/10 text-white rounded-none sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-black uppercase italic tracking-wider text-white">
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Kuponkód</Label>
              <Input 
                name="code" 
                required 
                placeholder="PL. SUMMER2024"
                className="bg-black border-white/5 h-12 text-white font-black uppercase tracking-[0.3em] focus-visible:ring-[#FF5500] rounded-none"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Típus</Label>
              <div className="flex gap-2 p-1 bg-white/5 border border-white/10">
                {(["percentage", "fixed", "free_shipping"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-grow py-3 text-[8px] font-black uppercase tracking-widest transition-all",
                      type === t ? "bg-[#FF5500] text-white" : "text-neutral-500 hover:text-white"
                    )}
                  >
                    {t === "percentage" ? "%" : t === "fixed" ? "FT" : "SZÁLLÍTÁS"}
                  </button>
                ))}
              </div>
            </div>

            {type !== "free_shipping" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Érték</Label>
                <Input 
                  name="value" 
                  type="number"
                  required 
                  placeholder="0"
                  className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-[#FF5500] rounded-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Min. Kosárérték</Label>
              <Input 
                name="minCartValue" 
                type="number"
                placeholder="0"
                className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-[#FF5500] rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Kezdő dátum</Label>
              <Input 
                name="startDate" 
                type="date"
                required
                className="bg-black border-white/5 h-12 text-white font-bold tracking-widest focus-visible:ring-[#FF5500] rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Lejárat dátuma</Label>
              <Input 
                name="endDate" 
                type="date"
                required
                className="bg-black border-white/5 h-12 text-white font-bold tracking-widest focus-visible:ring-[#FF5500] rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Max. Felhasználás</Label>
              <Input 
                name="maxUses" 
                type="number"
                placeholder="Üres = Végtelen"
                className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-[#FF5500] rounded-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 self-end h-12">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AKTÍV</p>
              <button 
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-12 h-6 rounded-none p-1 transition-colors duration-200 focus:outline-none",
                  isActive ? "bg-[#FF5500]" : "bg-neutral-800"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white transition-transform duration-200",
                  isActive ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="krausz" className="w-full h-14 tracking-[0.2em]">
              KUPON LÉTREHOZÁSA
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
