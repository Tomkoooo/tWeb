import {
  generateOrderGlsLabel,
  getOrderById,
  resendOrderInvoiceEmail,
  updateOrderInvoiceData,
  uploadManualInvoicePdf,
} from "@/actions/admin-orders"
import { OrderStatusButtons } from "@/components/admin/OrderStatusButtons"
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Calendar } from "lucide-react"
import {
  OrderParcelPanel,
} from "@/components/admin/OrderParcelPanel"
import { FoxpostShipmentPanel } from "@/components/admin/foxpost/FoxpostShipmentPanel"
import { getOrderParcelProvider, getOrderShippingTypeLabel, orderHasParcelShipping } from "@/lib/parcel-locker"
import { getOrderParcelDeliveryDisplay } from "@/lib/parcel-locker-checkout-display"
import {
  isFoxpostParcelManagerEnabled,
  isGlsParcelManagerEnabled,
} from "@/lib/parcel-feature-flags"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { formatOrderNumberLabel } from "@/lib/order-number"
import { formatHuf, priceBreakdownFromGross, totalsBreakdownForOrderSnapshot, clampVatPercent, DEFAULT_VAT_PERCENT } from "@/lib/pricing"

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(id)
  const [glsManagerEnabled, foxpostManagerEnabled] = await Promise.all([
    isGlsParcelManagerEnabled(),
    isFoxpostParcelManagerEnabled(),
  ])
  const parcelManagerEnabled = glsManagerEnabled || foxpostManagerEnabled
  const parcelProvider = order ? getOrderParcelProvider(order) : null
  const parcelDelivery = order ? getOrderParcelDeliveryDisplay(order) : null
  const totalBreakdown = order ? totalsBreakdownForOrderSnapshot(order) : null

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
            Rendelés <span className="admin-headline-accent">Részletei</span>
          </h1>
          <div className="flex items-center gap-4 text-white/40 italic">
            <span className="text-lg font-bold uppercase tracking-tight admin-text-accent">{formatOrderNumberLabel(order._id)}</span>
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none group-hover:bg-white/10 transition-colors" />
            <h2 className="text-xl font-bold mb-6 italic uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-6 admin-section-marker rounded-full" />
              Állapot Frissítése
            </h2>
            <OrderStatusButtons
              orderId={order._id.toString()}
              currentStatus={order.status}
            />
            {orderHasParcelShipping(order) ||
            order.glsLabel?.parcelNumber ||
            order.glsLabel?.lastError ||
            order.foxpostShipment?.clFoxId ||
            order.foxpostShipment?.lastError ? (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-300">
                  Csomagpont szállítás
                </h3>
                {!parcelManagerEnabled ? (
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    A csomag/címke kezelő ki van kapcsolva (Beállítások → feature flag-ek).
                  </p>
                ) : null}
                {parcelProvider === "gls" ? (
                  <OrderParcelPanel
                    parcelManagerEnabled={glsManagerEnabled}
                    provider="gls"
                    orderId={order._id.toString()}
                    glsParcelPoint={order.glsParcelPoint}
                    glsLabel={order.glsLabel}
                    generateGlsAction={async () => {
                      "use server"
                      return generateOrderGlsLabel(order._id.toString())
                    }}
                    generateFoxpostAction={async () => {
                      "use server"
                      return { success: true }
                    }}
                  />
                ) : null}
                {parcelProvider === "foxpost" ? (
                  <FoxpostShipmentPanel
                    source="live"
                    orderId={order._id.toString()}
                    parcelManagerEnabled={foxpostManagerEnabled}
                    foxpostParcelPoint={order.foxpostParcelPoint}
                    foxpostShipment={order.foxpostShipment}
                  />
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-300">Számla kezelés</h3>
              <div className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-300 space-y-1">
                <p>Invoice ID: <span className="text-white">{order.invoiceId || "-"}</span></p>
                <p>Invoice mód: <span className="text-white">{order.invoiceMode || "none"}</span></p>
                <p>Invoice státusz: <span className="text-white">{order.invoiceStatus || "pending"}</span></p>
                {order.invoiceLastError ? <p className="text-rose-400">HIBA: {order.invoiceLastError}</p> : null}
              </div>

              <form action={updateOrderInvoiceData.bind(null, order._id.toString())} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="invoiceId" defaultValue={order.invoiceId || ""} placeholder="Számlaszám" className="h-11 bg-black border border-white/10 px-3 text-white text-xs uppercase tracking-widest" />
                <input name="invoiceExternalId" defaultValue={order.invoiceExternalId || ""} placeholder="Külső invoice azonosító (opcionális)" className="h-11 bg-black border border-white/10 px-3 text-white text-xs" />
                <input name="invoiceIssuedAt" defaultValue={order.invoiceIssuedAt ? new Date(order.invoiceIssuedAt).toISOString().slice(0, 10) : ""} type="date" className="h-11 bg-black border border-white/10 px-3 text-white text-xs" />
                <select name="invoiceStatus" defaultValue={order.invoiceStatus || "manual"} className="h-11 bg-black border border-white/10 px-3 text-white text-xs uppercase tracking-widest">
                  <option value="pending">pending</option>
                  <option value="issued">issued</option>
                  <option value="failed">failed</option>
                  <option value="manual">manual</option>
                </select>
                <Button className="h-11 rounded-none bg-primary hover:bg-primary/80 text-white text-[10px] font-black uppercase tracking-widest md:col-span-2">
                  Számla adatok mentése
                </Button>
              </form>

              <form action={uploadManualInvoicePdf.bind(null, order._id.toString())} className="flex flex-col md:flex-row gap-3 md:items-center">
                <input type="file" name="file" accept=".pdf,application/pdf" required className="text-xs text-neutral-300" />
                <Button className="h-11 rounded-none admin-action-outline text-[10px] font-black uppercase tracking-widest">
                  Manuális számla PDF feltöltése
                </Button>
              </form>

              <div className="flex flex-wrap gap-3">
                <form action={resendOrderInvoiceEmail.bind(null, order._id.toString())}>
                  <Button className="h-11 rounded-none border border-white/15 bg-transparent hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest">
                    Számla email újraküldése
                  </Button>
                </form>
                <a href={`/api/admin/orders/${order._id.toString()}/invoice`} target="_blank" rel="noreferrer">
                  <Button className="h-11 rounded-none admin-action-outline text-[10px] font-black uppercase tracking-widest">
                    Számla PDF letöltése
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-none">
            <h2 className="text-xl font-bold mb-6 italic uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-6 admin-section-marker rounded-full" />
              Rendelt Tételek
            </h2>
            <div className="space-y-4">
              {order.items.map(
                (
                  item: {
                    name: string
                    quantity: number
                    variantLabel?: string
                    price: number
                    vatPercent?: number
                  },
                  index: number
                ) => {
                  const breakdown = priceBreakdownFromGross(
                    item.price,
                    item.quantity,
                    clampVatPercent(item.vatPercent ?? DEFAULT_VAT_PERCENT)
                  )
                  const isLimitedLine = item.name.toLowerCase().includes("limitált")
                  return (
                <div key={index} className="flex items-center gap-6 p-4 bg-black/40 border border-white/5 group hover:border-white/25 transition-all">
                  <div className="w-16 h-16 bg-neutral-950 flex items-center justify-center border border-white/10 group-hover:border-white/25 transition-colors overflow-hidden shrink-0">
                    <Package className="w-8 h-8 text-neutral-800" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-black text-white uppercase tracking-wider text-base">{item.name}</h3>
                      {isLimitedLine ? (
                        <span className="border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
                          Limitált ár
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-neutral-600 font-black tracking-[0.2em] uppercase mt-0.5">Mennység: {item.quantity} DB</p>
                    {item.variantLabel ? (
                      <p className="text-[10px] admin-value font-black tracking-[0.2em] uppercase mt-1">
                        Varians: {item.variantLabel}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white text-lg tracking-tighter">{formatHuf(breakdown.lineGross)}</p>
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                      Rögzített rendelési ár: {formatHuf(breakdown.unitGross)} / DB bruttó
                    </p>
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">
                      Egység nettó {formatHuf(breakdown.unitNet)} · Egység ÁFA {formatHuf(breakdown.unitVat)}
                    </p>
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Sor nettó {formatHuf(breakdown.lineNet)} · Sor ÁFA {formatHuf(breakdown.lineVat)}</p>
                  </div>
                </div>
                )
              })}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase italic">
                <span>Részösszeg:</span>
                <span>{formatHuf(order.subtotal)}</span>
              </div>
              {totalBreakdown && (
                <>
                  <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase italic">
                    <span>Nettó összesen:</span>
                    <span>{formatHuf(totalBreakdown.net)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase italic">
                    <span>ÁFA összesen:</span>
                    <span>{formatHuf(totalBreakdown.vat)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase italic">
                <span>Szállítás:</span>
                <span>{order.shippingFee === 0 ? "INGYENES" : formatHuf(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-highlight text-sm font-bold uppercase italic">
                  <span>Kedvezmény:</span>
                  <span>-{formatHuf(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white text-2xl font-black uppercase italic pt-2">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Végösszeg:
                </span>
                <span className="admin-headline-accent">
                  {formatHuf(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info */}
        <div className="space-y-8">
          {/* Customer Info Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-px h-full bg-linear-to-b from-transparent via-accent/20 to-transparent" />
            <h2 className="text-xl font-bold mb-8 italic uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-6 admin-section-marker rounded-full" />
              Vásárló adatai
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="p-3 admin-icon-well rounded-none grow-0 h-fit">
                  <User className="w-5 h-5 admin-icon-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Számlázási Név</p>
                  <p className="text-lg font-bold text-white uppercase italic leading-none">{order.billingInfo.name}</p>
                  {order.billingInfo.type === "company" && (
                    <div className="mt-2 text-[10px] font-black text-white uppercase tracking-[0.2em] bg-white/10 border border-white/20 px-2 py-1 inline-block">
                      ADÓSZÁM: {order.billingInfo.taxNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 admin-icon-well rounded-none grow-0 h-fit">
                  <MapPin className="w-5 h-5 admin-icon-accent" />
                </div>
                <div>
                  {parcelDelivery ? (
                    <>
                      <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">
                        {parcelDelivery.title}
                      </p>
                      {parcelDelivery.lines.map((line) => (
                        <p key={line} className="text-neutral-400 text-sm mt-1 first:mt-0">
                          {line}
                        </p>
                      ))}
                      {parcelDelivery.idLine ? (
                        <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-2">
                          {parcelDelivery.idLine}
                        </p>
                      ) : null}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">
                          Kapcsolattartó
                        </p>
                        <p className="text-white font-bold uppercase italic">{order.shippingAddress.name}</p>
                        <p className="text-neutral-500 text-xs mt-1">{order.shippingAddress.phone}</p>
                        <p className="text-neutral-500 text-xs">{order.shippingAddress.email}</p>
                        {order.shippingAddress.comment ? (
                          <div className="mt-3 p-3 bg-black/40 border-l-2 border-white/30 text-neutral-400 text-xs italic">
                            &quot;{order.shippingAddress.comment}&quot;
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">
                        Szállítási Cím
                      </p>
                      <p className="text-white font-bold uppercase italic">{order.shippingAddress.name}</p>
                      <p className="text-neutral-400 text-sm mt-1">
                        {order.shippingAddress.zip} {order.shippingAddress.city}
                      </p>
                      <p className="text-neutral-400 text-sm">{order.shippingAddress.street}</p>
                      {order.shippingAddress.comment ? (
                        <div className="mt-4 p-3 bg-black/40 border-l-2 border-white/30 text-neutral-400 text-xs italic">
                          &quot;{order.shippingAddress.comment}&quot;
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 admin-icon-well rounded-none grow-0 h-fit">
                  <Truck className="w-5 h-5 admin-icon-accent" />
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
                      <span className="text-xs font-black uppercase tracking-tight">
                        Szállítás:{" "}
                        {parcelDelivery?.providerLabel
                          ? parcelDelivery.lines[0]
                            ? `${parcelDelivery.providerLabel} — ${parcelDelivery.lines[0]}`
                            : parcelDelivery.providerLabel
                          : getOrderShippingTypeLabel(order) === "Standard"
                            ? "Futár"
                            : getOrderShippingTypeLabel(order)}
                      </span>
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
