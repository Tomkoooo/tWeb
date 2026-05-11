"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  type CheckoutStepAppearance,
  cxInput,
  cxLabel,
  cxTypeToggleBtn,
  cxTypeToggleShell,
} from "@/components/checkout/checkout-appearance"

interface BillingStepProps {
  data: any
  onChange: (data: any) => void
  /** @default "dark" */
  appearance?: CheckoutStepAppearance
}

export function BillingStep({ data, onChange, appearance = "dark" }: BillingStepProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }
  const a = appearance

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className={cxTypeToggleShell(a)}>
        <button
          type="button"
          onClick={() => handleChange("type", "personal")}
          className={cxTypeToggleBtn(a, data.type === "personal")}
        >
          Magánszemély
        </button>
        <button
          type="button"
          onClick={() => handleChange("type", "company")}
          className={cxTypeToggleBtn(a, data.type === "company")}
        >
          Cég
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label className={cxLabel(a)}>Név / Cégnév</Label>
          <Input
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={a === "light" ? "Teljes név vagy cégnév" : "TELJES NÉV VAGY CÉGNÉV"}
            className={cxInput(a)}
          />
        </div>

        {data.type === "company" && (
          <div className="space-y-2 md:col-span-2">
            <Label className={cxLabel(a)}>Adószám</Label>
            <Input
              value={data.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              placeholder="12345678-1-12"
              className={cxInput(a)}
            />
          </div>
        )}

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
          <Label className={cxLabel(a)}>Utca, házszám, emelet/ajtó</Label>
          <Input
            value={data.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder={a === "light" ? "Utca, házszám…" : "VALAMI UTCA 12. 3/4"}
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
    </div>
  )
}
