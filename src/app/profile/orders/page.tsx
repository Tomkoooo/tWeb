"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { hu } from "date-fns/locale"

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
        .then(res => res.json())
        .then(data => {
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
        <div className="w-8 h-8 border-t-2 border-[#FF5500] border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  const ongoingStatuses = ["pending", "processing", "shipped"]
  const ongoingOrders = orders.filter(o => ongoingStatuses.includes(o.status))
  const completedOrders = orders.filter(o => !ongoingStatuses.includes(o.status))

  const OrderCard = ({ order }: { order: any }) => (
    <Link href={`/profile/orders/${order._id}`}>
      <div className="border border-white/10 p-6 hover:border-[#FF5500] hover:bg-white/5 transition-all group group cursor-pointer h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
              {format(new Date(order.createdAt), "yyyy. MM. dd. HH:mm", { locale: hu })}
            </span>
            <span className="text-xs font-black uppercase tracking-widest px-2 py-1 bg-white/10">
              {order.status === "pending" && "Függőben"}
              {order.status === "processing" && "Feldolgozás alatt"}
              {order.status === "shipped" && "Kiszállítva"}
              {order.status === "delivered" && "Átvéve"}
              {order.status === "cancelled" && "Törölve"}
            </span>
          </div>
          <div className="space-y-1 mb-6">
            {order.items.map((item: any, i: number) => (
              <p key={i} className="text-sm font-medium text-white truncate">
                {item.quantity}x {item.name}
              </p>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-between items-center group-hover:border-[#FF5500]/50 transition-colors">
          <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Összesen</span>
          <span className="font-black text-white text-lg">{order.total.toLocaleString("hu-HU")} FT</span>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-8 border-b border-white/10 pb-4">
        Rendeléseim
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/20">
          <p className="text-neutral-500 uppercase tracking-widest font-bold text-sm">Nincsenek még rendeléseid.</p>
        </div>
      ) : (
        <>
          {ongoingOrders.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#FF5500] uppercase tracking-[0.2em]">Folyamatban lévő</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoingOrders.map(order => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </div>
          )}

          {completedOrders.length > 0 && (
            <div className="space-y-6 pt-6">
              <h3 className="text-sm font-black text-neutral-500 uppercase tracking-[0.2em]">Lezárt rendelések</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 hover:opacity-100 transition-opacity">
                {completedOrders.map(order => (
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
