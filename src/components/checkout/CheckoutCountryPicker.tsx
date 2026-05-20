"use client"

import * as React from "react"
import { allIsoCountryCodes, getCountryDisplayName, resolveCountryInput } from "@/lib/country-codes"
import {
  type CheckoutStepAppearance,
  cxInput,
  cxLabel,
} from "@/components/checkout/checkout-appearance"

export type TradingLimits = {
  shippingAllowedCountryCodes: string[]
  invoicingAllowedCountryCodes: string[]
  shippingRestricted: boolean
  invoicingRestricted: boolean
}

type Props = {
  id: string
  /** ISO alpha-2 */
  valueCode: string
  onChangeCode: (code: string) => void
  /** When set + shop restricts this kind, picker only lists allowed countries. */
  limits: TradingLimits | null
  kind: "billing" | "shipping"
  label?: string
  appearance?: CheckoutStepAppearance
}

export function CheckoutCountryPicker({
  id,
  valueCode,
  onChangeCode,
  limits,
  kind,
  label = "Ország",
  appearance = "dark",
}: Props) {
  const a = appearance
  const restriction =
    kind === "billing"
      ? limits?.invoicingRestricted
        ? limits.invoicingAllowedCountryCodes
        : null
      : limits?.shippingRestricted
        ? limits.shippingAllowedCountryCodes
        : null

  const options = React.useMemo(() => {
    const pool = restriction && restriction.length > 0 ? restriction : allIsoCountryCodes().slice().sort((x, y) => x.localeCompare(y))
    return pool.map((code) => ({ code, label: getCountryDisplayName(code, "hu-HU") }))
  }, [restriction])

  const [freeInput, setFreeInput] = React.useState("")
  const hints = React.useMemo(() => {
    if (!freeInput.trim()) return []
    const resolved = resolveCountryInput(freeInput).suggestions
    if (restriction && restriction.length > 0) {
      return resolved.filter((h) => restriction.includes(h.code))
    }
    return resolved
  }, [freeInput, restriction])

  return (
    <div className="space-y-2 md:col-span-2">
      <label htmlFor={id} className={cxLabel(a)}>
        {label} (ISO)
      </label>
      <select
        id={id}
        value={valueCode}
        onChange={(e) => onChangeCode(e.target.value)}
        className={cxInput(a)}
      >
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.label} ({o.code})
          </option>
        ))}
      </select>
      {restriction && restriction.length > 0 ? (
        <p className="text-[10px] text-neutral-500">
          {kind === "billing"
            ? "Ez a bolt csak a felsorolt országoknak állít ki számlát."
            : "Ez a bolt csak a felsorolt országokba szállít."}
        </p>
      ) : null}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500">Nem találod? Írd be a nevet vagy a kódot</p>
        <input
          type="text"
          value={freeInput}
          onChange={(e) => setFreeInput(e.target.value)}
          placeholder="pl. Ausztria vagy AT"
          className={cxInput(a)}
        />
        {hints.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {hints.map((h) => (
              <button
                key={h.code}
                type="button"
                className="text-[10px] border border-white/20 px-2 py-1 uppercase tracking-widest text-neutral-200 hover:border-primary"
                onClick={() => {
                  onChangeCode(h.code)
                  setFreeInput("")
                }}
              >
                {h.code} — {h.labelHu}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
