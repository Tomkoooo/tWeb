import { getOrderFilterProducts, getOrders } from "@/actions/admin-orders"
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable"
import { AdminOrdersExportLink } from "@/components/admin/AdminOrdersExportLink"
import { Button } from "@/components/ui/button"
import type { AdminOrderFilters } from "@/lib/admin-orders-query"

type AdminOrdersSearchParams = Promise<AdminOrderFilters>

function buildExportHref(filters: AdminOrderFilters) {
  const params = new URLSearchParams()
  const entries: Array<keyof AdminOrderFilters> = [
    "q",
    "status",
    "invoiceStatus",
    "shippingType",
    "productId",
    "dateFrom",
    "dateTo",
  ]
  for (const key of entries) {
    const value = filters[key]
    if (value && value !== "all") {
      params.set(key, value)
    }
  }
  const query = params.toString()
  return query ? `/api/admin/orders/export?${query}` : "/api/admin/orders/export"
}

export default async function AdminOrders({ searchParams }: { searchParams: AdminOrdersSearchParams }) {
  const filters = await searchParams
  const [orders, products] = await Promise.all([getOrders(filters), getOrderFilterProducts()])
  const exportHref = buildExportHref(filters)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            Rendelések <span className="admin-headline-accent">Kezelése</span>
          </h1>
          <p className="text-white/40 font-medium italic">Kísérje figyelemmel a beérkező rendeléseket és frissítse az állapotukat.</p>
        </div>
        <AdminOrdersExportLink href={exportHref} />
      </div>

      <form className="grid grid-cols-1 items-end gap-3 bg-white/5 border border-white/10 p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <input
          name="q"
          defaultValue={filters.q || ""}
          placeholder="Keresés: azonosító, név, email, város..."
          className="md:col-span-2 h-12 bg-black border border-white/10 px-4 text-sm text-white placeholder:text-neutral-600 rounded-none"
        />
        <select
          name="productId"
          defaultValue={filters.productId || "all"}
          className="h-12 bg-black border border-white/10 px-4 text-sm text-white rounded-none"
        >
          <option value="all">Minden termék</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
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
        <div className="flex min-w-0 items-end gap-2 md:col-span-2 xl:col-span-2">
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

      <AdminOrdersTable orders={orders} />
    </div>
  )
}
