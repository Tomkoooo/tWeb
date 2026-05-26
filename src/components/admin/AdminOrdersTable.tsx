"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Calendar, Eye, Package, ShoppingCart, Tag, User } from "lucide-react"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { bulkUpdateOrderStatuses } from "@/actions/admin-orders"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { cn } from "@/lib/utils"
import { formatOrderNumberLabel } from "@/lib/order-number"
import { formatHuf, totalsBreakdownForOrderSnapshot } from "@/lib/pricing"
import { getOrderShippingTypeLabel, orderNeedsParcelLabel } from "@/lib/parcel-locker"
import { getOrderDeliveryLocationHint } from "@/lib/parcel-locker-checkout-display"
import type { FoxpostParcelPoint } from "@/lib/foxpost"
import type { GlsParcelPoint } from "@/lib/gls"

const STATUSES = [
  { value: "pending", label: "Függőben" },
  { value: "processing", label: "Feldolgozás alatt" },
  { value: "shipped", label: "Szállítva" },
  { value: "delivered", label: "Kézbesítve" },
  { value: "cancelled", label: "Törölve" },
] as const

type OrderStatusValue = (typeof STATUSES)[number]["value"]

type AdminOrder = {
  _id: string
  createdAt: string | Date
  status: string
  billingInfo: {
    name?: string
  }
  shippingAddress?: {
    city?: string
  }
  items: Array<{
    name?: string
    price: number
    quantity: number
    vatPercent?: number
  }>
  subtotal: number
  shippingFee: number
  paymentFee: number
  total: number
  discount?: number
  invoiceId?: string
  invoiceStatus?: string
  glsParcelPoint?: GlsParcelPoint | null
  foxpostParcelPoint?: FoxpostParcelPoint | null
  glsLabel?: {
    parcelNumber?: string
    labelDataBase64?: string
  } | null
  foxpostShipment?: {
    clFoxId?: string
    labelDataBase64?: string
  } | null
}

type AdminOrdersTableProps = {
  orders: AdminOrder[]
}

function getStatusStyle(status: string) {
  switch (status) {
    case "pending": return "bg-amber-500/10 border-amber-500 text-amber-500"
    case "processing": return "bg-blue-500/10 border-blue-500 text-blue-500"
    case "shipped": return "bg-purple-500/10 border-purple-500 text-purple-500"
    case "delivered": return "bg-emerald-500/10 border-emerald-500 text-emerald-500"
    case "cancelled": return "bg-rose-500/10 border-rose-500 text-rose-500"
    default: return "bg-white/5 border-white/10 text-neutral-500"
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "FÜGGŐBEN",
    processing: "FELDOLGOZÁS ALATT",
    shipped: "SZÁLLÍTVA",
    delivered: "KÉZBESÍTVE",
    cancelled: "TÖRÖLVE",
  }
  return labels[status] || status.toUpperCase()
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<OrderStatusValue>("processing")
  const [isUpdating, setIsUpdating] = useState(false)

  const visibleOrderIds = useMemo(() => orders.map((order) => String(order._id)), [orders])
  const selectedVisibleIds = useMemo(
    () => visibleOrderIds.filter((orderId) => selectedIds.has(orderId)),
    [selectedIds, visibleOrderIds]
  )
  const selectedCount = selectedVisibleIds.length
  const allVisibleSelected = visibleOrderIds.length > 0 && selectedCount === visibleOrderIds.length
  const partiallySelected = selectedCount > 0 && !allVisibleSelected

  const toggleOrder = (orderId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allVisibleSelected) {
        visibleOrderIds.forEach((orderId) => next.delete(orderId))
      } else {
        visibleOrderIds.forEach((orderId) => next.add(orderId))
      }
      return next
    })
  }

  const handleBulkUpdate = async () => {
    if (selectedVisibleIds.length === 0 || isUpdating) return

    setIsUpdating(true)
    try {
      const result = await bulkUpdateOrderStatuses(selectedVisibleIds, bulkStatus)
      setSelectedIds((current) => {
        const next = new Set(current)
        selectedVisibleIds.forEach((orderId) => next.delete(orderId))
        return next
      })
      router.refresh()

      const label = STATUSES.find((status) => status.value === bulkStatus)?.label ?? bulkStatus
      const skippedText = result.skippedCount > 0 ? ` ${result.skippedCount} már ezen a státuszon volt.` : ""
      const missingText = result.missingCount > 0 ? ` ${result.missingCount} rendelés nem található.` : ""
      toast.success(`${result.updatedCount} rendelés státusza frissítve: ${label}.${skippedText}${missingText}`)
    } catch (error) {
      console.error("Bulk order status update failed:", error)
      toast.error("A kijelölt rendelések frissítése sikertelen. Próbálja újra.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border border-white/10 bg-white/5 p-4 text-white md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            Tömeges státusz módosítás
          </p>
          <p className="mt-1 text-sm font-bold italic text-white/70">
            {selectedCount > 0 ? `${selectedCount} rendelés kijelölve` : "Jelöljön ki rendeléseket a listából."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={bulkStatus}
            onChange={(event) => setBulkStatus(event.target.value as OrderStatusValue)}
            disabled={selectedCount === 0 || isUpdating}
            className="h-12 min-w-52 rounded-none border border-white/10 bg-black px-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={selectedCount === 0 || isUpdating}
            onClick={() => void handleBulkUpdate()}
            className="h-12 rounded-none bg-primary px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary/80"
          >
            {isUpdating ? <LoadingSpinner size="xs" className="shrink-0" /> : null}
            Státusz frissítése
          </Button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-none overflow-hidden text-white shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-5">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    aria-checked={partiallySelected ? "mixed" : allVisibleSelected}
                    disabled={orders.length === 0 || isUpdating}
                    onChange={toggleAllVisible}
                    className="h-4 w-4 rounded-none border-white/20 bg-black accent-primary disabled:opacity-40"
                    aria-label="Összes látható rendelés kijelölése"
                    title="Összes látható rendelés kijelölése"
                  />
                </th>
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
                  <td colSpan={9} className="px-6 py-20 text-center text-white/20 italic">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-5" />
                    Még nem érkezett rendelés.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const orderId = String(order._id)
                  const breakdown = totalsBreakdownForOrderSnapshot(order)
                  const isSelected = selectedIds.has(orderId)

                  return (
                    <tr
                      key={orderId}
                      className={cn(
                        "hover:bg-white/5 transition-all duration-300 group",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <td className="px-6 py-6 align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isUpdating}
                          onChange={() => toggleOrder(orderId)}
                          className="h-4 w-4 rounded-none border-white/20 bg-black accent-primary disabled:opacity-40"
                          aria-label={`${formatOrderNumberLabel(order._id)} rendelés kijelölése`}
                        />
                      </td>
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
                          <span className="font-black text-white text-sm tracking-widest">{order.items.reduce((sum, item) => sum + item.quantity, 0)} DB</span>
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
                          {Number(order.discount || 0) > 0 ? (
                            <div className="flex items-center gap-1 mt-1 text-highlight">
                              <Tag className="w-3 h-3" />
                              <span className="text-[8px] font-black uppercase tracking-[0.2em]">KEDVEZMÉNYES</span>
                            </div>
                          ) : null}
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
