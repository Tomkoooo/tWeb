"use client"

import * as React from "react"
import { Truck, CreditCard, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MethodsStepProps {
  data: any
  onChange: (data: any) => void
}

export function MethodsStep({ data, onChange }: MethodsStepProps) {
  const [methods, setMethods] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch("/api/checkout/methods")
        if (res.ok) {
          const fetched = await res.json()
          setMethods(fetched)
        }
      } catch (error) {
        console.error("Error fetching methods:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMethods()
  }, [])

  const handleMethodChange = (type: "shippingMethod" | "paymentMethod", id: string) => {
    onChange({ ...data, [type]: id })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-t-2 border-[#FF5500] animate-spin rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Shipping Methods */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-[#FF5500]" />
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Szállítási mód</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {methods?.shippingMethods.map((method: any) => (
            <button
              key={method._id}
              onClick={() => handleMethodChange("shippingMethod", method._id)}
              className={cn(
                "p-6 border-2 text-left transition-all duration-300 flex items-center justify-between group",
                data.shippingMethod === method._id ? "bg-white/5 border-[#FF5500]" : "bg-black border-white/5 hover:border-white/10"
              )}
            >
              <div>
                <p className="font-black text-white uppercase tracking-widest text-xs mb-1">{method.name}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  Házhozszállítás várható ideje: 1-3 munkanap
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-white text-lg">{method.grossPrice.toLocaleString("hu-HU")} FT</p>
                {data.shippingMethod === method._id && <Check className="w-4 h-4 text-[#FF5500] ml-auto mt-1" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-[#FF5500]" />
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Fizetési mód</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {methods?.paymentMethods.map((method: any) => (
            <button
              key={method._id}
              onClick={() => handleMethodChange("paymentMethod", method._id)}
              className={cn(
                "p-6 border-2 text-left transition-all duration-300 flex items-center justify-between group",
                data.paymentMethod === method._id ? "bg-white/5 border-[#FF5500]" : "bg-black border-white/5 hover:border-white/10"
              )}
            >
              <div>
                <p className="font-black text-white uppercase tracking-widest text-xs mb-1">{method.name}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  Kezelési költséggel együtt
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-white text-lg">{method.grossPrice.toLocaleString("hu-HU")} FT</p>
                {data.paymentMethod === method._id && <Check className="w-4 h-4 text-[#FF5500] ml-auto mt-1" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
