"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { BillingStep } from "@/components/checkout/BillingStep"
import { ShippingStep } from "@/components/checkout/ShippingStep"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const [formData, setFormData] = React.useState({
    billing: { type: "personal", name: "", taxNumber: "", zip: "", city: "", street: "" },
    shipping: { isSameAsBilling: true, name: "", zip: "", city: "", street: "", comment: "" }
  })

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setFormData({
              billing: data.billingInfo || { type: "personal", name: "", taxNumber: "", zip: "", city: "", street: "" },
              shipping: data.shippingAddress || { isSameAsBilling: true, name: "", zip: "", city: "", street: "", comment: "" }
            })
          }
        })
        .finally(() => setLoading(false))
    }
  }, [status, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingInfo: formData.billing,
          shippingAddress: formData.shipping
        })
      })

      if (res.ok) {
        toast.success("Adatok sikeresen mentve!")
      } else {
        toast.error("Hiba történt a mentés során")
      }
    } catch {
      toast.error("Hálózati hiba történt")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Biztosan törölni szeretnéd a fiókod? Ez a művelet visszavonhatatlan!")) return
    
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Hiba történt a törlés során")
      } else {
        toast.success("Fiók sikeresen törölve!")
        signOut({ callbackUrl: "/" })
      }
    } catch {
      toast.error("Hálózati hiba történt")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-t-2 border-[#FF5500] border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-8 border-b border-white/10 pb-4">
          Címadatok
        </h2>
        
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#FF5500] uppercase tracking-[0.2em]">Számlázási Adatok</h3>
            <BillingStep 
              data={formData.billing} 
              onChange={(data) => setFormData(p => ({ ...p, billing: data }))} 
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#FF5500] uppercase tracking-[0.2em]">Szállítási Adatok</h3>
            <ShippingStep 
              data={formData.shipping} 
              billingData={formData.billing}
              onChange={(data) => setFormData(p => ({ ...p, shipping: data }))} 
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto bg-white !text-black hover:bg-neutral-200 rounded-none h-14 px-10 font-black uppercase tracking-widest text-xs"
          >
            {saving ? "Mentés folyamatban..." : "Adatok Mentése"}
          </Button>
        </div>
      </div>

      <div className="pt-12 border-t border-white/10 space-y-6">
        <h2 className="text-xl font-black text-red-500 uppercase tracking-[0.2em]">Veszélyes zóna</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-neutral-900 border border-white/10 hover:border-white/30 hover:bg-neutral-800 text-white rounded-none h-12 px-8 font-black uppercase tracking-widest text-xs"
          >
            Kijelentkezés
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-none h-12 px-8 font-black uppercase tracking-widest text-xs"
          >
            Fiók Törlése
          </Button>
        </div>
      </div>
    </div>
  )
}
