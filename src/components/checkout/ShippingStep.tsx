"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ShippingStepProps {
  data: any
  onChange: (data: any) => void
  billingData: any
}

export function ShippingStep({ data, onChange, billingData }: ShippingStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const toggleSameAsBilling = () => {
    const isNowSame = !data.isSameAsBilling
    if (isNowSame) {
      handleChange("isSameAsBilling", true)
      // We don't necessarily need to copy values here, 
      // the parent logic can handle use of billingData if this is true
    } else {
      handleChange("isSameAsBilling", false)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <button
        onClick={toggleSameAsBilling}
        className="flex items-center gap-4 group cursor-pointer"
      >
        <div className={cn(
          "w-6 h-6 border-2 flex items-center justify-center transition-all duration-300",
          data.isSameAsBilling ? "bg-[#FF5500] border-[#FF5500]" : "border-white/20 bg-transparent group-hover:border-white/40"
        )}>
          {data.isSameAsBilling && (
            <Check className="w-4 h-4 text-white scale-in-center" />
          )}
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
          Megegyezik a számlázási adatokkal
        </span>
      </button>

      <AnimatePresence>
        {!data.isSameAsBilling && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Átvevő Neve</Label>
                <Input 
                  value={data.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="TELJES NÉV"
                  className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Irányítószám</Label>
                <Input 
                  value={data.zip}
                  onChange={(e) => handleChange("zip", e.target.value)}
                  placeholder="1234"
                  className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Város</Label>
                <Input 
                  value={data.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="BUDAPEST"
                  className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Utca, házszám</Label>
                <Input 
                  value={data.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  placeholder="VALAMI UTCA 12."
                  className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Megjegyzés a futárnak (opcionális)</Label>
        <textarea 
          value={data.comment}
          onChange={(e) => handleChange("comment", e.target.value)}
          rows={3}
          placeholder="RÉSZLETEK A SZÁLLÍTÁSHOZ..."
          className="w-full bg-black border border-white/5 rounded-none p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5500] transition-all resize-none"
        />
      </div>
    </div>
  )
}

import { motion, AnimatePresence } from "framer-motion"
