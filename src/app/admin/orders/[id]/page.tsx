import { getOrderById, updateOrderStatus } from "@/actions/admin-orders"
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Calendar, Tag, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { revalidatePath } from "next/cache"

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-white space-y-4">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Rendelés nem található</h1>
        <Link href="/admin/orders">
          <Button variant="krausz">VISSZA A LISTÁHOZ</Button>
        </Link>
      </div>
    )
  }

  const statuses = [
    { value: "pending", label: "FÜGGŐBEN", color: "amber" },
    { value: "processing", label: "FELDOLGOZÁS", color: "blue" },
    { value: "shipped", label: "SZÁLLÍTVA", color: "purple" },
    { value: "delivered", label: "KÉZBESÍTVE", color: "emerald" },
    { value: "cancelled", label: "TÖRÖLVE", color: "rose" }
  ]

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-500 border-amber-500/20 bg-amber-500/5"
      case "processing": return "text-blue-500 border-blue-500/20 bg-blue-500/5"
      case "shipped": return "text-purple-500 border-purple-500/20 bg-purple-500/5"
      case "delivered": return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
      case "cancelled": return "text-rose-500 border-rose-500/20 bg-rose-500/5"
      default: return "text-neutral-500 border-white/10 bg-white/5"
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <Link href="/admin/orders" className="group flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vissza a rendelésekhez</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            Rendelés <span className="text-accent underline decoration-accent/10 underline-offset-8">Részletei</span>
          </h1>
          <div className="flex items-center gap-4 text-white/40 italic">
            <span className="text-lg font-bold uppercase tracking-tight text-accent">#{order._id.toString().slice(-6).toUpperCase()}</span>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{format(new Date(order.createdAt), "yyyy. MMMM dd. HH:mm", { locale: hu })}</span>
            </div>
          </div>
        </div>

        <div className={cn(
          "px-6 py-3 border font-black uppercase tracking-[0.3em] text-sm shadow-xl",
          getStatusStyle(order.status)
        )}>
          {order.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form and Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Status Update Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none group-hover:bg-accent/10 transition-colors" />
            <h2 className="text-xl font-bold mb-6 italic uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              Állapot Frissítése
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {statuses.map((status) => (
                <form key={status.value} action={async () => {
                  "use server"
                  await updateOrderStatus(order._id.toString(), status.value)
                }}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full h-14 rounded-none border text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      order.status === status.value 
                        ? `border-${status.color}-500 bg-${status.color}-500/20 text-${status.color}-500 shadow-lg shadow-${status.color}-500/10` 
                        : "border-white/5 text-neutral-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {order.status === status.value && <CheckCircle2 className="w-3 h-3 mr-2" />}
                    {status.label}
                  </Button>
                </form>
              ))}
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-none">
            <h2 className="text-xl font-bold mb-6 italic uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              Rendelt Tételek
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-6 p-4 bg-black/40 border border-white/5 group hover:border-accent/30 transition-all">
                  <div className="w-16 h-16 bg-neutral-950 flex items-center justify-center border border-white/10 group-hover:border-accent/20 transition-colors overflow-hidden shrink-0">
                    <Package className="w-8 h-8 text-neutral-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-black text-white uppercase tracking-wider text-base">{item.name}</h3>
                    <p className="text-[10px] text-neutral-600 font-black tracking-[0.2em] uppercase mt-0.5">Mennység: {item.quantity} DB</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white text-lg tracking-tighter">{(item.price * item.quantity).toLocaleString("hu-HU")} <span className="text-xs text-accent">FT</span></p>
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">{item.price.toLocaleString("hu-HU")} FT / DB</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase italic">
                <span>Részösszeg:</span>
                <span>{order.subtotal.toLocaleString("hu-HU")} FT</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase italic">
                <span>Szállítás:</span>
                <span>{order.shippingFee === 0 ? "INGYENES" : `${order.shippingFee.toLocaleString("hu-HU")} FT`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#FFD700] text-sm font-bold uppercase italic">
                  <span>Kedvezmény:</span>
                  <span>-{order.discount.toLocaleString("hu-HU")} FT</span>
                </div>
              )}
              <div className="flex justify-between text-white text-2xl font-black uppercase italic pt-2">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Végösszeg:
                </span>
                <span className="text-accent underline decoration-accent/20 underline-offset-8">
                  {order.total.toLocaleString("hu-HU")} FT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info */}
        <div className="space-y-8">
          {/* Customer Info Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
            <h2 className="text-xl font-bold mb-8 italic uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              Vásárló adatai
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="p-3 bg-accent/10 rounded-none border border-accent/20 grow-0 h-fit">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Számlázási Név</p>
                  <p className="text-lg font-bold text-white uppercase italic leading-none">{order.billingInfo.name}</p>
                  {order.billingInfo.type === "company" && (
                    <div className="mt-2 text-[10px] font-black text-accent uppercase tracking-[0.2em] bg-accent/5 border border-accent/20 px-2 py-1 inline-block">
                      ADÓSZÁM: {order.billingInfo.taxNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-accent/10 rounded-none border border-accent/20 grow-0 h-fit">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Szállítási Cím</p>
                  <p className="text-white font-bold uppercase italic">{order.shippingAddress.name}</p>
                  <p className="text-neutral-400 text-sm mt-1">{order.shippingAddress.zip} {order.shippingAddress.city}</p>
                  <p className="text-neutral-400 text-sm">{order.shippingAddress.street}</p>
                  {order.shippingAddress.comment && (
                    <div className="mt-4 p-3 bg-black/40 border-l-2 border-accent text-neutral-400 text-xs italic">
                      "{order.shippingAddress.comment}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-accent/10 rounded-none border border-accent/20 grow-0 h-fit">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Módszerek</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/80">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-xs font-black uppercase tracking-tight">Fizetés: Online</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Truck className="w-3.5 h-3.5" />
                      <span className="text-xs font-black uppercase tracking-tight">Szállítás: Futár</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
