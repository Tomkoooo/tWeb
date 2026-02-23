import * as React from "react"
import dbConnect from "@/lib/db"
import Coupon from "@/models/Coupon"
import { Plus, Trash2, Tag, Calendar, Users, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { deleteCoupon, createCoupon } from "@/actions/admin-checkout"
import { CouponDialog } from "@/components/admin/CouponDialog"

export default async function AdminCouponsPage() {
  await dbConnect()
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean()

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            KUPONOK <span className="text-[#FF5500] underline decoration-[#FF5500]/10 underline-offset-8">KEZELÉSE</span>
          </h1>
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Kedvezményes kódok és promóciók beállítása</p>
        </div>
        <CouponDialog 
          title="ÚJ KUPON LÉTREHOZÁSA" 
          action={createCoupon}
        >
          <Button variant="krausz" className="h-14 px-8 tracking-[0.2em]">
            <Plus className="w-5 h-5" />
            ÚJ KUPON
          </Button>
        </CouponDialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {coupons.map((coupon: any) => (
          <div key={coupon._id} className="glass-card p-8 border-white/5 group hover:border-[#FF5500]/20 transition-all duration-500">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/20">
                  <Tag className="w-8 h-8 text-[#FF5500]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-heading font-black text-white uppercase italic tracking-tighter">{coupon.code}</h3>
                    <div className={cn(
                      "px-2 py-0.5 text-[8px] font-black tracking-widest uppercase",
                      coupon.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {coupon.isActive ? "AKTÍV" : "INAKTÍV"}
                    </div>
                  </div>
                  <p className="text-[#FF5500] font-black uppercase tracking-widest text-xs">
                    {coupon.type === "percentage" ? `${coupon.value}% KEDVEZMÉNY` : 
                     coupon.type === "fixed" ? `${coupon.value.toLocaleString("hu-HU")} FT KEDVEZMÉNY` : 
                     "INGYENES SZÁLLÍTÁS"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow max-w-3xl">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Időszak
                  </p>
                  <p className="text-[10px] text-white font-bold uppercase whitespace-nowrap">
                    {new Date(coupon.startDate).toLocaleDateString("hu-HU")} - {new Date(coupon.endDate).toLocaleDateString("hu-HU")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag className="w-3 h-3" /> Min. Kosár
                  </p>
                  <p className="text-[10px] text-white font-bold uppercase">
                    {coupon.minCartValue ? `${coupon.minCartValue.toLocaleString("hu-HU")} FT` : "NINCS"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" /> Felhasználás
                  </p>
                  <p className="text-[10px] text-white font-bold uppercase">
                    {coupon.usedCount} / {coupon.maxUses || "∞"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                   <form action={deleteCoupon.bind(null, coupon._id.toString())}>
                    <Button variant="ghost" className="h-10 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-none text-[10px] font-black uppercase tracking-widest">
                      <Trash2 className="w-4 h-4 mr-2" /> TÖRLÉS
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="glass-card p-20 border-white/5 text-center">
            <Tag className="w-12 h-12 text-neutral-800 mx-auto mb-6" />
            <p className="text-neutral-500 font-bold uppercase tracking-[0.2em]">Nincsenek létrehozott kuponok</p>
          </div>
        )}
      </div>
    </div>
  )
}
