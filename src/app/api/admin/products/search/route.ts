import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { shopCommerceBlockedResponse } from "@/lib/features/shop"
import { ProductService } from "@/services/product"

type ProductListItem = {
  _id: { toString(): string }
  name: string
  slug: string
}

export async function GET(request: NextRequest) {
  const blocked = shopCommerceBlockedResponse()
  if (blocked) return blocked
  await requireAdmin()
  const query = request.nextUrl.searchParams.get("q") ?? ""
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1")
  const data = await ProductService.getPaginated(page, 12, {
    isVisible: true,
    search: query.trim() || undefined,
  })

  return NextResponse.json({
    items: (data.products as ProductListItem[]).map((item) => ({
      id: item._id.toString(),
      name: item.name,
      slug: item.slug,
    })),
    total: data.total,
  })
}
