"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { formatOrderNumberLabel } from "@/lib/order-number"
import { formatHuf, totalsBreakdownFromGross } from "@/lib/pricing"

export default function OrdersPage() {
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated") {
      fetch("/api/user/orders")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [status, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent" />
      </div>
    )
  }

  const ongoingStatuses = ["pending", "processing", "shipped"]
  const ongoingOrders = orders.filter((o) => ongoingStatuses.includes(o.status))
  const completedOrders = orders.filter((o) => !ongoingStatuses.includes(o.status))

  const OrderCard = ({ order }: { order: any }) => {
    const breakdown = totalsBreakdownFromGross(order.total)
    return (
      <Link href={`/profile/orders/${order._id}`}>
        <div className="group flex h-full cursor-pointer flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div className="space-y-1">
                <span className="block text-sm font-black uppercase tracking-widest text-foreground">
                  {formatOrderNumberLabel(order._id)}
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {format(new Date(order.createdAt), "yyyy. MM. dd. HH:mm", { locale: hu })}
                </span>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-black uppercase tracking-widest text-foreground">
                {order.status === "pending" && "Függőben"}
                {order.status === "processing" && "Feldolgozás alatt"}
                {order.status === "shipped" && "Kiszállítva"}
                {order.status === "delivered" && "Átvéve"}
                {order.status === "cancelled" && "Törölve"}
              </span>
            </div>
            <div className="mb-6 space-y-1">
              {order.items.map((item: any, i: number) => (
                <p key={i} className="truncate text-sm font-medium text-foreground">
                  {item.quantity}x {item.name}
                  {item.variantLabel ? <span className="text-primary"> ({item.variantLabel})</span> : null}
                </p>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4 transition-colors group-hover:border-primary/30">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Összesen</span>
            <div className="text-right">
              <span className="block text-lg font-black text-foreground">{formatHuf(breakdown.gross)}</span>
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Nettó {formatHuf(breakdown.net)} · ÁFA {formatHuf(breakdown.vat)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-12 duration-500 animate-in fade-in slide-in-from-right-4">
      <h2 className="mb-8 border-b border-border pb-4 text-xl font-black uppercase tracking-[0.2em] text-foreground">
        Rendeléseim
      </h2>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nincsenek még rendeléseid.</p>
        </div>
      ) : (
        <>
          {ongoingOrders.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Folyamatban lévő</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {ongoingOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </div>
          )}

          {completedOrders.length > 0 && (
            <div className="space-y-6 pt-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Lezárt rendelések</h3>
              <div className="grid grid-cols-1 gap-4 opacity-90 transition-opacity hover:opacity-100 md:grid-cols-2">
                {completedOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
