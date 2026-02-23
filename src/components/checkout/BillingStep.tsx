"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface BillingStepProps {
  data: any
  onChange: (data: any) => void
}

export function BillingStep({ data, onChange }: BillingStepProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex gap-4 p-1 bg-white/5 border border-white/10 w-fit">
        <button
          onClick={() => handleChange("type", "personal")}
          className={cn(
            "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
            data.type === "personal" ? "bg-[#FF5500] text-white" : "text-neutral-500 hover:text-white"
          )}
        >
          Magánszemély
        </button>
        <button
          onClick={() => handleChange("type", "company")}
          className={cn(
            "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
            data.type === "company" ? "bg-[#FF5500] text-white" : "text-neutral-500 hover:text-white"
          )}
        >
          Cég
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Név / Cégnév</Label>
          <Input 
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="TELJES NÉV VAGY CÉGNÉV"
            className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
          />
        </div>

        {data.type === "company" && (
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Adószám</Label>
            <Input 
              value={data.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              placeholder="12345678-1-12"
              className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
            />
          </div>
        )}

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
          <Label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Utca, házszám, emelet/ajtó</Label>
          <Input 
            value={data.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="VALAMI UTCA 12. 3/4"
            className="bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-[#FF5500] rounded-none"
          />
        </div>
      </div>
    </div>
  )
}
