import { CategoryService } from "@/services/category"
import { ProductService } from "@/services/product"
import { TemplateService } from "@/services/template"
import { templateSupportsPerProductPdpCms } from "@/lib/product-page-content"
import ProductForm from "../new/ProductForm"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories, template] = await Promise.all([
    ProductService.getById(id),
    CategoryService.getAll(),
    TemplateService.getActive(),
  ])
  
  if (!product) return notFound()

  const initialData = JSON.parse(JSON.stringify(product))
  const plainCategories = JSON.parse(JSON.stringify(categories))
  const visualPageHref = templateSupportsPerProductPdpCms(template.manifest.capabilities)
    ? `/admin/products/${id}/visual-page`
    : undefined

  return (
    <ProductForm
      categories={plainCategories}
      initialData={initialData}
      isEdit
      visualPageHref={visualPageHref}
    />
  )
}
