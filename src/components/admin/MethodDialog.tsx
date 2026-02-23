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

interface MethodDialogProps {
  children: React.ReactNode
  title: string
  action: (formData: FormData) => Promise<void>
  initialData?: any
}

export function MethodDialog({ children, title, action, initialData }: MethodDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isActive, setIsActive] = React.useState(initialData?.isActive ?? true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-black border-white/10 text-white rounded-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-black uppercase italic tracking-wider text-white">
            {title}
          </DialogTitle>
        </DialogHeader>
        <form action={async (formData) => {
          await action(formData)
          setOpen(false)
        }} className="space-y-8 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Megnevezés</Label>
            <Input 
              name="name" 
              defaultValue={initialData?.name}
              required 
              placeholder="PL. HÁZHOZSZÁLLÍTÁS"
              className="bg-black border-white/5 h-12 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Bruttó Ár (FT)</Label>
            <Input 
              name="grossPrice" 
              type="number"
              defaultValue={initialData?.grossPrice}
              required 
              placeholder="0"
              className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-[#FF5500] rounded-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AKTÍV</p>
              <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-1">LÁTHATÓ A PÉNZTÁRBAN</p>
            </div>
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
            <input type="hidden" name="isActive" value={isActive.toString()} />
          </div>

          <div className="pt-4">
            <Button type="submit" variant="krausz" className="w-full h-14 tracking-[0.2em]">
              {initialData ? "MÓDOSÍTÁSOK MENTÉSE" : "LÉTREHOZÁS"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
