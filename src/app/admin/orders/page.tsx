import { getOrderFilterProducts, getOrdersWorkspace } from "@/actions/admin-orders"
import { AdminOrdersWorkspace } from "@/components/admin/AdminOrdersWorkspace"
import { AdminOrdersExportLink } from "@/components/admin/AdminOrdersExportLink"
import type { AdminOrderFilters } from "@/lib/admin-orders-filters"
import {
  isFoxpostParcelManagerEnabled,
  isGlsParcelManagerEnabled,
} from "@/lib/parcel-feature-flags"

type AdminOrdersSearchParams = Promise<
  AdminOrderFilters & {
    view?: string
    assignStart?: string
    assignEnd?: string
  }
>

const FILTER_KEYS: Array<keyof AdminOrderFilters> = [
  "q",
  "status",
  "invoiceStatus",
  "shippingType",
  "productId",
  "dateFrom",
  "dateTo",
  "updatedFrom",
  "updatedTo",
  "statusChangedOn",
  "statusChangedFrom",
  "statusChangedTo",
  "foxpostLabelOn",
  "foxpostLabelFrom",
  "foxpostLabelTo",
  "glsLabelOn",
  "glsLabelFrom",
  "glsLabelTo",
  "unitsMin",
  "unitsMax",
  "kindsMin",
  "kindsMax",
  "totalMin",
  "totalMax",
  "labelState",
  "billingType",
  "mix",
  "sort",
  "deletedFilter",
]

function buildExportQuery(filters: AdminOrderFilters) {
  const params = new URLSearchParams()
  for (const key of FILTER_KEYS) {
    const value = filters[key]
    if (value && value !== "all") {
      params.set(key, value)
    }
  }
  return params.toString()
}

function parseView(value?: string): "list" | "mix" | "assign" {
  if (value === "mix" || value === "assign") return value
  return "list"
}

function parseIndex(value?: string): number | undefined {
  if (value == null || value === "") return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

export default async function AdminOrders({ searchParams }: { searchParams: AdminOrdersSearchParams }) {
  const params = await searchParams
  const { view: viewParam, assignStart: assignStartParam, assignEnd: assignEndParam, ...filterParams } = params
  const filters = filterParams as AdminOrderFilters

  const [data, products, glsManagerEnabled, foxpostManagerEnabled] = await Promise.all([
    getOrdersWorkspace(filters),
    getOrderFilterProducts(),
    isGlsParcelManagerEnabled(),
    isFoxpostParcelManagerEnabled(),
  ])

  const exportQuery = buildExportQuery(filters)
  const view = parseView(viewParam)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AdminOrdersExportLink
          exportQuery={exportQuery}
          labelsZipEnabled={glsManagerEnabled || foxpostManagerEnabled}
        />
      </div>
      <AdminOrdersWorkspace
        data={data}
        filters={filters}
        products={products}
        glsManagerEnabled={glsManagerEnabled}
        foxpostManagerEnabled={foxpostManagerEnabled}
        exportQuery={exportQuery}
        view={view}
        assignStart={parseIndex(assignStartParam)}
        assignEnd={parseIndex(assignEndParam)}
      />
    </div>
  )
}
