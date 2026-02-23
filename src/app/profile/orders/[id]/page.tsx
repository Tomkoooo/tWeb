"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { toast } from "sonner"
import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderDetailPage() {
  const { status, data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated" && orderId) {
      fetch(`/api/user/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setOrder(data)
        })
        .finally(() => setLoading(false))
    }
  }, [status, router, orderId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-t-2 border-[#FF5500] border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-4">
          A rendelés nem található
        </h2>
        <Link href="/profile/orders" className="text-[#FF5500] font-black uppercase tracking-widest text-xs hover:underline">
          <ArrowLeft className="w-4 h-4 inline mr-2" /> Vissza a rendelésekhez
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <Link href="/profile/orders" className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] hover:text-[#FF5500] flex items-center mb-4 transition-colors">
            <ArrowLeft className="w-3 h-3 mr-2" /> Vissza
          </Link>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">
            Rendelés: <span className="text-neutral-500">{order._id.slice(-6)}</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Dátum</p>
          <p className="font-black text-white uppercase text-sm tracking-widest">
            {format(new Date(order.createdAt), "yyyy. MM. dd. HH:mm", { locale: hu })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-black text-[#FF5500] uppercase tracking-[0.2em]">Státusz</h3>
          <p className="font-bold text-white uppercase tracking-widest text-sm p-4 border border-white/10 bg-white/5 inline-block">
            {order.status === "pending" && "Függőben"}
            {order.status === "processing" && "Feldolgozás alatt"}
            {order.status === "shipped" && "Kiszállítva"}
            {order.status === "delivered" && "Átvéve"}
            {order.status === "cancelled" && "Törölve"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Szállítás</p>
            <p className="text-xs font-bold text-white">{order.shippingAddress.name}</p>
            <p className="text-xs text-neutral-400">{order.shippingAddress.zip} {order.shippingAddress.city}</p>
            <p className="text-xs text-neutral-400">{order.shippingAddress.street}</p>
            {order.shippingMethod && <p className="text-[#FF5500] text-xs font-black uppercase tracking-widest mt-2">{order.shippingMethod.name}</p>}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Számlázás</p>
            <p className="text-xs font-bold text-white">{order.billingInfo.name}</p>
            <p className="text-xs text-neutral-400">{order.billingInfo.zip} {order.billingInfo.city}</p>
            <p className="text-xs text-neutral-400">{order.billingInfo.street}</p>
            {order.billingInfo.type === "company" && <p className="text-xs text-neutral-400">Adószám: {order.billingInfo.taxNumber}</p>}
            {order.paymentMethod && <p className="text-[#FF5500] text-xs font-black uppercase tracking-widest mt-2">{order.paymentMethod.name}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black text-[#FF5500] uppercase tracking-[0.2em]">Termékek</h3>
        <div className="border border-white/10 divide-y divide-white/10">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div className="flex items-center gap-6 flex-1">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.name} className="w-16 h-16 object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-white/5 border border-white/10" />
                )}
                <div>
                  <h4 className="font-black text-white tracking-widest uppercase text-sm mb-1">
                    {item.product ? (
                      <Link href={`/products/${item.product.slug}`} className="hover:text-[#FF5500] transition-colors">
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </h4>
                  <p className="text-xs text-neutral-500 font-bold tracking-widest">{item.quantity} db x {item.price.toLocaleString("hu-HU")} FT</p>
                </div>
              </div>

              {/* Product Review logic if delivered */}
              {order.status === "delivered" && item.product && (
                <div className="w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  <ReviewForm productId={item.product._id} userId={session?.user?.id} existingRatings={item.product.ratings} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border border-white/10 p-6 space-y-4">
        <div className="flex justify-between items-center text-sm font-bold text-neutral-400">
          <span>Részösszeg</span>
          <span>{order.subtotal.toLocaleString("hu-HU")} FT</span>
        </div>
        <div className="flex justify-between items-center text-sm font-bold text-neutral-400">
          <span>Szállítási költség</span>
          <span>{order.shippingFee.toLocaleString("hu-HU")} FT</span>
        </div>
        <div className="flex justify-between items-center text-sm font-bold text-neutral-400">
          <span>Kezelési költség</span>
          <span>{order.paymentFee.toLocaleString("hu-HU")} FT</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between items-center text-sm font-bold text-[#FF5500]">
            <span>Kedvezmény (-{order.discount.toLocaleString("hu-HU")} FT)</span>
          </div>
        )}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="font-black text-white uppercase tracking-[0.2em]">Összesen</span>
          <span className="text-2xl font-black text-white">{order.total.toLocaleString("hu-HU")} FT</span>
        </div>
      </div>
    </div>
  )
}

function ReviewForm({ productId, userId, existingRatings }: { productId: string, userId: string | undefined, existingRatings: any[] }) {
  const existingReview = existingRatings?.find(r => r.user === userId)
  const [rating, setRating] = React.useState(existingReview?.rating || 0)
  const [comment, setComment] = React.useState(existingReview?.comment || "")
  const [hoveredRating, setHoveredRating] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Kérjük, válassz csillagot az értékeléshez!")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/user/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment })
      })

      if (res.ok) {
        toast.success("Értékelés sikeresen elküldve!")
        setIsOpen(false)
      } else {
        const err = await res.json()
        toast.error(err.error || "Hiba történt")
      }
    } catch {
      toast.error("Hálózati hiba")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (existingReview && !isOpen) {
    return (
      <div className="text-right">
        <div className="flex items-center gap-1 mb-1 justify-end">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-3 h-3 ${star <= existingReview.rating ? "fill-[#FF5500] text-[#FF5500]" : "text-neutral-700"}`} />
          ))}
        </div>
        <button onClick={() => setIsOpen(true)} className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-black transition-colors underline">
          Értékelés módosítása
        </button>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-transparent border border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500] hover:text-white rounded-none h-10 px-6 font-black uppercase tracking-widest text-[10px] transition-colors"
      >
        Értékelem
      </Button>
    )
  }

  return (
    <div className="space-y-4 min-w-[300px] border border-white/10 p-4 bg-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-white uppercase tracking-widest">Értékelés:</span>
        <div className="flex items-center gap-1 cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className={`w-5 h-5 transition-colors ${
                star <= (hoveredRating || rating) ? "fill-[#FF5500] text-[#FF5500]" : "text-neutral-700"
              }`}
            />
          ))}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Néhány szó a termékről (opcionális)..."
        className="w-full bg-black border border-white/10 rounded-none p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF5500] resize-none h-20"
      />
      <div className="flex gap-2">
        <Button 
          onClick={() => setIsOpen(false)}
          className="flex-1 bg-transparent border border-white/10 text-white hover:bg-white/10 rounded-none h-10 font-black uppercase tracking-widest text-[10px]"
        >
          Mégse
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-[#FF5500] hover:bg-[#FF5500]/80 text-white rounded-none h-10 font-black uppercase tracking-widest text-[10px]"
        >
          {isSubmitting ? "..." : "Küldés"}
        </Button>
      </div>
    </div>
  )
}
