"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { formatHuf, priceBreakdownFromGross } from "@/lib/pricing"
import { AdminFormField } from "@/components/admin/AdminFormField"

type Props = {
  netPrice: number
  grossPrice: number
  vatPercent: number
  onNetChange: (net: number) => void
  onGrossChange: (gross: number) => void
  netName?: string
  grossName?: string
  showVatHint?: boolean
  compact?: boolean
  className?: string
}

export function AdminPricePairFields({
  netPrice,
  grossPrice,
  vatPercent,
  onNetChange,
  onGrossChange,
  netName,
  grossName,
  showVatHint = true,
  compact = false,
  className,
}: Props) {
  const breakdown = priceBreakdownFromGross(grossPrice, 1, vatPercent)
  const h = compact ? "h-11" : "h-12"
  const inputClass = `bg-black border-white/5 ${h} pl-12 text-white rounded-none w-full`

  const netField = (
    <AdminFormField label="Nettó ár (Ft)">
      <div className="relative">
        <Input
          type="number"
          name={netName}
          value={netPrice}
          onChange={(e) => onNetChange(Number(e.target.value) || 0)}
          className={inputClass}
        />
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-600">
          FT
        </div>
      </div>
    </AdminFormField>
  )

  const grossField = (
    <AdminFormField label="Bruttó ár (Ft)">
      <div className="relative">
        <Input
          type="number"
          name={grossName}
          value={grossPrice}
          onChange={(e) => onGrossChange(Number(e.target.value) || 0)}
          className={inputClass}
        />
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-600">
          FT
        </div>
      </div>
      {showVatHint && !compact ? (
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          ÁFA: {formatHuf(breakdown.unitVat)} ({breakdown.vatPercent}%)
        </p>
      ) : null}
    </AdminFormField>
  )

  if (compact) {
    return (
      <div
        className={cn(
          "col-span-2 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:col-span-2 xl:col-span-2",
          className
        )}
      >
        {netField}
        {grossField}
      </div>
    )
  }

  return (
    <>
      {netField}
      {grossField}
    </>
  )
}
