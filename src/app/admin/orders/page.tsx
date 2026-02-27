import { getOrders } from "@/actions/admin-orders"
import { ShoppingCart, Eye, Package, User, Calendar, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { hu } from "date-fns/locale"

export default async function AdminOrders() {
  const orders = await getOrders()

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 border-amber-500 text-amber-500"
      case "processing": return "bg-blue-500/10 border-blue-500 text-blue-500"
      case "shipped": return "bg-purple-500/10 border-purple-500 text-purple-500"
      case "delivered": return "bg-emerald-500/10 border-emerald-500 text-emerald-500"
      case "cancelled": return "bg-rose-500/10 border-rose-500 text-rose-500"
      default: return "bg-white/5 border-white/10 text-neutral-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "FÜGGŐBEN",
      processing: "FELDOLGOZÁSALATT",
      shipped: "SZÁLLÍTVA",
      delivered: "KÉZBESÍTVE",
      cancelled: "TÖRÖLVE"
    }
    return labels[status] || status.toUpperCase()
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
          Rendelések <span className="text-accent underline decoration-accent/10 underline-offset-8">Kezelése</span>
        </h1>
        <p className="text-white/40 font-medium italic">Kísérje figyelemmel a beérkező rendeléseket és frissítse az állapotukat.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-none overflow-hidden text-white shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Azonosító / Dátum</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Vásárló</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Termékek</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Állapot</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Összeg</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-white/20 italic">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-5" />
                    Még nem érkezett rendelés.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-all duration-300 group">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-heading font-black text-white uppercase tracking-wider text-base">#{order._id.toString().slice(-6).toUpperCase()}</span>
                        <div className="flex items-center gap-1.5 mt-1 text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {format(new Date(order.createdAt), "yyyy. LLLL dd. HH:mm", { locale: hu })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-accent" />
                          <span className="font-bold text-white uppercase tracking-tight italic">{order.billingInfo.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-600 font-black tracking-widest uppercase mt-0.5">{order.shippingAddress.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-neutral-700" />
                        <span className="font-black text-white text-sm tracking-widest">{order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} DB</span>
                        <span className="text-[10px] text-neutral-600 font-black tracking-widest">({order.items.length} TÉTEL)</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "inline-block px-3 py-1.5 border font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 shadow-sm",
                        getStatusStyle(order.status)
                      )}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-lg tracking-tighter">
                          {order.total.toLocaleString("hu-HU")} <span className="text-xs text-accent">FT</span>
                        </span>
                        {order.discount > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[#FFD700]">
                            <Tag className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">KEDVEZMÉNYES</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link href={`/admin/orders/${order._id}`}>
                        <Button variant="ghost" size="icon" className="w-12 h-12 hover:bg-accent/20 text-neutral-500 hover:text-accent rounded-none border border-transparent hover:border-accent/30 transition-all shadow-lg" title="Megtekintés">
                          <Eye className="w-5 h-5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
