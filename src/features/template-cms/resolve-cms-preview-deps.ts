import { CategoryService } from "@/services/category"
import { ProductService } from "@/services/product"
import type { TemplateModule } from "@/templates/types"
import { resolveCommerceProductCard } from "@/templates/resolve-commerce-slots"

/**
 * Server deps for `/admin/cms/shop` preview (mirrors storefront shape).
 */
export async function getShopCmsPreviewDeps(
  template: TemplateModule,
  pageSize: number
) {
  const filters = {
    search: undefined as string | undefined,
    category: undefined as string | undefined,
    isDiscounted: false,
    sort: "newest" as const,
    isActive: true,
    isVisible: true,
  }

  const [paginationResult, categoriesResult] = await Promise.all([
    ProductService.getPaginated(1, pageSize, filters),
    CategoryService.getTree(),
  ])

  const products = JSON.parse(JSON.stringify(paginationResult.products))
  const categories = JSON.parse(JSON.stringify(categoriesResult)) as unknown[]
  const total = paginationResult.total
  const pages = paginationResult.pages

  return {
    products,
    categories,
    total,
    pages,
    currentPage: 1,
    query: {} as {
      q?: string
      category?: string
      discounted?: boolean
      sort?: string
      page?: number
    },
    shopRendering: { ProductCard: resolveCommerceProductCard(template) },
  }
}

/** First visible product for PDP CMS preview, or `null` when catalog is empty. */
export async function getPdpPreviewProduct() {
  const res = await ProductService.getPaginated(1, 1, {
    isActive: true,
    isVisible: true,
    sort: "newest",
  })
  const raw = res.products[0]
  if (!raw) return null
  return JSON.parse(JSON.stringify(raw))
}
