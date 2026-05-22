import { getOrders } from "@/actions/admin-orders"
import { ShoppingCart, Eye, Package, User, Calendar, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { formatOrderNumberLabel } from "@/lib/order-number"
import { formatHuf, totalsBreakdownForOrderSnapshot } from "@/lib/pricing"
import { getOrderShippingTypeLabel, orderNeedsParcelLabel } from "@/lib/parcel-locker"
import { getOrderDeliveryLocationHint } from "@/lib/parcel-locker-checkout-display"

type AdminOrdersSearchParams = Promise<{
  q?: string
  status?: string
  invoiceStatus?: string
  shippingType?: string
  dateFrom?: string
  dateTo?: string
}>

export default async function AdminOrders({ searchParams }: { searchParams: AdminOrdersSearchParams }) {
  const filters = await searchParams
  const orders = await getOrders(filters)

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
          Rendelések <span className="admin-headline-accent">Kezelése</span>
        </h1>
        <p className="text-white/40 font-medium italic">Kísérje figyelemmel a beérkező rendeléseket és frissítse az állapotukat.</p>
      </div>

      <form className="grid grid-cols-1 items-end gap-3 bg-white/5 border border-white/10 p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <input
          name="q"
          defaultValue={filters.q || ""}
          placeholder="Keresés: azonosító, név, email, város..."
          className="md:col-span-2 h-12 bg-black border border-white/10 px-4 text-sm text-white placeholder:text-neutral-600 rounded-none"
        />
        <select
          name="status"
          defaultValue={filters.status || "all"}
          className="h-12 bg-black border border-white/10 px-4 text-sm text-white rounded-none uppercase"
        >
          <option value="all">Minden státusz</option>
          <option value="pending">Függőben</option>
          <option value="processing">Feldolgozás alatt</option>
          <option value="shipped">Szállítva</option>
          <option value="delivered">Kézbesítve</option>
          <option value="cancelled">Törölve</option>
        </select>
        <select
          name="invoiceStatus"
          defaultValue={filters.invoiceStatus || "all"}
          className="h-12 bg-black border border-white/10 px-4 text-sm text-white rounded-none uppercase"
        >
          <option value="all">Minden számla</option>
          <option value="pending">Pending</option>
          <option value="issued">Issued</option>
          <option value="failed">Failed</option>
          <option value="manual">Manual</option>
        </select>
        <select
          name="shippingType"
          defaultValue={filters.shippingType || "all"}
          className="h-12 bg-black border border-white/10 px-4 text-sm text-white rounded-none uppercase"
        >
          <option value="all">Minden szállítás</option>
          <option value="gls">GLS csomagpont</option>
          <option value="foxpost">Foxpost</option>
          <option value="standard">Standard</option>
        </select>
        <input
          type="date"
          name="dateFrom"
          defaultValue={filters.dateFrom || ""}
          className="h-12 bg-black border border-white/10 px-4 text-sm text-white rounded-none"
        />
        <div className="flex min-w-0 items-end gap-2 md:col-span-2 xl:col-span-1">
          <input
            type="date"
            name="dateTo"
            defaultValue={filters.dateTo || ""}
            className="h-12 min-w-0 flex-1 rounded-none border border-white/10 bg-black px-4 text-sm text-white"
          />
          <Button
            type="submit"
            className="h-12 shrink-0 rounded-none bg-primary font-black uppercase tracking-widest text-[10px] text-white hover:bg-primary/80"
          >
            Szűrés
          </Button>
        </div>
      </form>

      <div className="bg-white/5 border border-white/10 rounded-none overflow-hidden text-white shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Azonosító / Dátum</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Vásárló</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Termékek</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Szállítás</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Állapot</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Számla</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Összeg</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-white/20 italic">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-5" />
                    Még nem érkezett rendelés.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const breakdown = totalsBreakdownForOrderSnapshot(order)
                  return (
                  <tr key={order._id} className="hover:bg-white/5 transition-all duration-300 group">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-heading font-black text-white uppercase tracking-wider text-base">{formatOrderNumberLabel(order._id)}</span>
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
                          <User className="w-3 h-3 admin-icon-accent" />
                          <span className="font-bold text-white uppercase tracking-tight italic">{order.billingInfo.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-600 font-black tracking-widest uppercase mt-0.5">
                          {getOrderDeliveryLocationHint(order)}
                        </span>
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
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                          {getOrderShippingTypeLabel(order)}
                        </span>
                        {orderNeedsParcelLabel(order) ? (
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                            Címke hiányzik
                          </span>
                        ) : null}
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
                      <div className="text-[10px] font-black uppercase tracking-widest space-y-1">
                        <p className={order.invoiceId ? "text-emerald-400" : "text-neutral-500"}>
                          {order.invoiceId ? "VAN SZÁMLA" : "NINCS SZÁMLA"}
                        </p>
                        <p className="text-neutral-400">{order.invoiceId || "-"}</p>
                        <p className="text-neutral-600">{order.invoiceStatus || "pending"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-lg tracking-tighter">
                          {formatHuf(breakdown.gross)}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">
                          Nettó {formatHuf(breakdown.net)} · ÁFA {formatHuf(breakdown.vat)}
                        </span>
                        {order.discount > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-highlight">
                            <Tag className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">KEDVEZMÉNYES</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link href={`/admin/orders/${order._id}`}>
                        <Button variant="ghost" size="icon" className="w-12 h-12 hover:bg-white/10 text-neutral-500 hover:text-white rounded-none border border-transparent hover:border-white/30 transition-all shadow-lg" title="Megtekintés">
                          <Eye className="w-5 h-5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
