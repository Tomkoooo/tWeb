"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ShopFeedbackPage() {
  const { status } = useSession()
  const router = useRouter()
  
  const [rating, setRating] = React.useState(0)
  const [hoveredRating, setHoveredRating] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error("Kérjük, válassz legalább 1 csillagot!")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      })

      if (res.ok) {
        toast.success("Köszönjük az értékelést!")
        // Optional: redirect to profile or reset form
        router.push("/profile")
      } else {
        const err = await res.json()
        toast.error(err.error || "Hiba történt a küldés során")
      }
    } catch {
      toast.error("Hálózati hiba történt")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-t-2 border-[#FF5500] border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl">
      <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-8 border-b border-white/10 pb-4">
        Bolt Értékelése
      </h2>

      <div className="bg-white/5 border border-white/10 p-8 space-y-8">
        <div>
          <h3 className="text-sm font-black text-[#FF5500] uppercase tracking-widest mb-4">
            Mennyire voltál elégedett a vásárlásoddal?
          </h3>
          <p className="text-sm text-neutral-400 mb-6 font-medium">
            Minden visszajelzés segít nekünk, hogy még jobb szolgáltatást és minőségibb ruhákat biztosíthassunk a jövőben. Ezt a funkciót csak sikeres (átvett) rendelés után használhatod.
          </p>

          <div className="flex items-center gap-2 mb-8 justify-center p-6 bg-black border border-white/5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`w-12 h-12 cursor-pointer transition-colors ${
                  star <= (hoveredRating || rating) ? "fill-[#FF5500] text-[#FF5500]" : "text-neutral-700"
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">További észrevételek (opcionális)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Írd meg nekünk a véleményed, észrevételed..."
                className="w-full bg-black border border-white/5 p-4 text-white placeholder-neutral-700 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-colors resize-none h-32"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5500] hover:bg-[#FF5500]/80 text-white rounded-none h-14 font-black uppercase tracking-widest text-xs"
            >
              {loading ? "Küldés folyamatban..." : "Értékelés beküldése"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
