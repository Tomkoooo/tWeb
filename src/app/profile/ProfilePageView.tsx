"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { BillingStep } from "@/components/checkout/BillingStep"
import { ShippingStep } from "@/components/checkout/ShippingStep"

export type ProfilePageVariant = "page" | "embedded"

export function ProfilePageView({ variant = "page" }: { variant?: ProfilePageVariant }) {
  const embedded = variant === "embedded"
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [newsletterEnabled, setNewsletterEnabled] = React.useState(false)

  const [formData, setFormData] = React.useState({
    billing: { type: "personal", name: "", taxNumber: "", zip: "", city: "", street: "" },
    shipping: { isSameAsBilling: true, name: "", zip: "", city: "", street: "", comment: "" },
    newsletterSubscribed: false,
  })

  React.useEffect(() => {
    const loadNewsletterFeature = async () => {
      try {
        const response = await fetch("/api/feature-flags/newsletter")
        if (!response.ok) return
        const data = await response.json()
        setNewsletterEnabled(Boolean(data.enabled))
      } catch {
        setNewsletterEnabled(false)
      }
    }
    loadNewsletterFeature()
  }, [])

  React.useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        billing: {
          ...prev.billing,
          name: session.user.name || prev.billing.name,
        },
        shipping: {
          ...prev.shipping,
          name: session.user.name || prev.shipping.name,
        },
      }))
    }
  }, [session])

  React.useEffect(() => {
    if (status === "unauthenticated") {
      if (embedded) {
        setLoading(false)
        return
      }
      router.push("/auth/login")
      return
    }

    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setFormData({
              billing: data.billingInfo || {
                type: "personal",
                name: "",
                taxNumber: "",
                zip: "",
                city: "",
                street: "",
              },
              shipping: data.shippingAddress || {
                isSameAsBilling: true,
                name: "",
                zip: "",
                city: "",
                street: "",
                comment: "",
              },
              newsletterSubscribed: Boolean(data.newsletterSubscribed),
            })
          }
        })
        .finally(() => setLoading(false))
    }
  }, [status, router, embedded])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: {
        billingInfo: typeof formData.billing
        shippingAddress: typeof formData.shipping
        newsletterSubscribed?: boolean
      } = {
        billingInfo: formData.billing,
        shippingAddress: formData.shipping,
      }
      if (newsletterEnabled) {
        payload.newsletterSubscribed = formData.newsletterSubscribed
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent" />
      </div>
    )
  }

  if (embedded && status === "unauthenticated") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="mb-3 font-medium text-foreground">Profil előnézet</p>
        <p className="mb-4">A valós űrlaphoz jelentkezz be ugyanabban a böngészőben.</p>
        <Button asChild variant="outline" className="rounded-none font-black uppercase tracking-widest">
          <Link href="/auth/login">Bejelentkezés</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-12 duration-500 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="mb-8 border-b border-white/10 pb-4 text-xl font-black uppercase tracking-[0.2em] text-white">
          Címadatok
        </h2>

        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Számlázási Adatok</h3>
            <BillingStep
              data={formData.billing}
              onChange={(data) => setFormData((p) => ({ ...p, billing: data }))}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Szállítási Adatok</h3>
            <ShippingStep
              data={formData.shipping}
              billingData={formData.billing}
              onChange={(data) => setFormData((p) => ({ ...p, shipping: data }))}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-14 w-full rounded-none bg-white px-10 font-black uppercase tracking-widest text-black hover:bg-neutral-200 md:w-auto"
          >
            {saving ? "Mentés folyamatban..." : "Adatok Mentése"}
          </Button>

          {newsletterEnabled ? (
            <div className="space-y-3 border border-white/10 bg-white/5 p-5">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Hírlevél</h4>
              <p className="text-sm text-neutral-400">Itt tudsz feliratkozni vagy leiratkozni a hírlevelekről.</p>
              <label className="inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.newsletterSubscribed}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newsletterSubscribed: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm text-white">Feliratkozva a hírlevélre</span>
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6 border-t border-white/10 pt-12">
        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-red-500">Veszélyes zóna</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="h-12 rounded-none border border-white/10 bg-neutral-900 px-8 font-black uppercase tracking-widest text-xs text-white hover:border-white/30 hover:bg-neutral-800"
          >
            Kijelentkezés
          </Button>
          <Button
            onClick={handleDeleteAccount}
            className="h-12 rounded-none border border-red-500/30 bg-red-500/10 px-8 font-black uppercase tracking-widest text-xs text-red-500 hover:bg-red-500/20"
          >
            Fiók Törlése
          </Button>
        </div>
      </div>
    </div>
  )
}
