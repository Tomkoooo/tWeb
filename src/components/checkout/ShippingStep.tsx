"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  type CheckoutStepAppearance,
  cxInput,
  cxLabel,
  cxTextarea,
} from "@/components/checkout/checkout-appearance"

interface ShippingStepProps {
  data: any
  onChange: (data: any) => void
  billingData: any
  /** @default "dark" */
  appearance?: CheckoutStepAppearance
}

export function ShippingStep({ data, onChange, billingData: _billingData, appearance = "dark" }: ShippingStepProps) {
  void _billingData
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value })
  }
  const a = appearance

  const toggleSameAsBilling = () => {
    const isNowSame = !data.isSameAsBilling
    if (isNowSame) {
      handleChange("isSameAsBilling", true)
    } else {
      handleChange("isSameAsBilling", false)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <button type="button" onClick={toggleSameAsBilling} className="flex cursor-pointer items-center gap-4 group">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center border-2 transition-all duration-300",
            data.isSameAsBilling
              ? "border-primary bg-primary"
              : a === "light"
                ? "border-border bg-transparent group-hover:border-primary/50"
                : "border-white/20 bg-transparent group-hover:border-white/40"
          )}
        >
          {data.isSameAsBilling && <Check className="scale-in-center h-4 w-4 text-primary-foreground" />}
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.2em]",
            a === "light" ? "text-foreground" : "font-black text-white"
          )}
        >
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
            <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className={cxLabel(a)}>Átvevő neve</Label>
                <Input
                  value={data.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={a === "light" ? "Teljes név" : "TELJES NÉV"}
                  className={cxInput(a)}
                />
              </div>

              <div className="space-y-2">
                <Label className={cxLabel(a)}>Irányítószám</Label>
                <Input
                  value={data.zip}
                  onChange={(e) => handleChange("zip", e.target.value)}
                  placeholder="1234"
                  className={cxInput(a)}
                />
              </div>

              <div className="space-y-2">
                <Label className={cxLabel(a)}>Város</Label>
                <Input
                  value={data.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder={a === "light" ? "Budapest" : "BUDAPEST"}
                  className={cxInput(a)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className={cxLabel(a)}>Utca, házszám</Label>
                <Input
                  value={data.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  placeholder={a === "light" ? "Utca, házszám" : "VALAMI UTCA 12."}
                  className={cxInput(a)}
                />
              </div>

              <div className="space-y-2">
                <Label className={cxLabel(a)}>E-mail</Label>
                <Input
                  type="email"
                  value={data.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="name@example.com"
                  className={cxInput(a)}
                />
              </div>

              <div className="space-y-2">
                <Label className={cxLabel(a)}>Telefonszám</Label>
                <Input
                  value={data.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+36701234567"
                  className={cxInput(a)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <Label className={cxLabel(a)}>Megjegyzés a futárnak (opcionális)</Label>
        <textarea
          value={data.comment}
          onChange={(e) => handleChange("comment", e.target.value)}
          rows={3}
          placeholder={a === "light" ? "Részletek a szállításhoz…" : "RÉSZLETEK A SZÁLLÍTÁSHOZ..."}
          className={cxTextarea(a)}
        />
      </div>
    </div>
  )
}
