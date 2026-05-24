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
import { CheckoutCountryPicker, type TradingLimits } from "@/components/checkout/CheckoutCountryPicker"
import { TradingLimitsContactNote } from "@/components/checkout/TradingLimitsContactNote"
import { getCountryDisplayName } from "@/lib/country-codes"

interface BillingStepProps {
  data: any
  onChange: (data: any) => void
  tradingLimits?: TradingLimits | null
  /** @default "dark" */
  appearance?: CheckoutStepAppearance
}

export function BillingStep({ data, onChange, tradingLimits = null, appearance = "dark" }: BillingStepProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }
  const a = appearance
  const fieldClass = cn(cxInput(a), a === "dark" && "shadow-none dark:bg-transparent")

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 sm:space-y-8">
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

      <TradingLimitsContactNote limits={tradingLimits} kind="billing" appearance={a} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <CheckoutCountryPicker
          id="checkout-billing-country"
          className="md:col-span-2"
          valueCode={data.countryCode || "HU"}
          limits={tradingLimits}
          kind="billing"
          appearance={a}
          onChangeCode={(code) =>
            onChange({
              ...data,
              countryCode: code,
              country: getCountryDisplayName(code, "hu-HU"),
            })
          }
        />
        <div className="space-y-2 md:col-span-2">
          <Label className={cxLabel(a)}>Név / Cégnév</Label>
          <Input
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={a === "light" ? "Teljes név vagy cégnév" : "Teljes név vagy cégnév"}
            className={fieldClass}
          />
        </div>

        {data.type === "company" && (
          <div className="space-y-2 md:col-span-2">
            <Label className={cxLabel(a)}>Adószám</Label>
            <Input
              value={data.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              placeholder="12345678-1-12"
              className={fieldClass}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className={cxLabel(a)}>Irányítószám</Label>
          <Input
            value={data.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
            placeholder="1234"
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label className={cxLabel(a)}>Város</Label>
          <Input
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder={a === "light" ? "Budapest" : "Budapest"}
            className={fieldClass}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className={cxLabel(a)}>Utca, házszám, emelet/ajtó</Label>
          <Input
            value={data.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder={a === "light" ? "Utca, házszám…" : "Valami utca 12. 3/4"}
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label className={cxLabel(a)}>E-mail</Label>
          <Input
            type="email"
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="name@example.com"
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label className={cxLabel(a)}>Telefonszám</Label>
          <Input
            value={data.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+36701234567"
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  )
}
