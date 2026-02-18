import { CategoryService } from "@/services/category"
import { ProductService } from "@/services/product"
import ProductForm from "../new/ProductForm"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    ProductService.getById(id),
    CategoryService.getAll()
  ])
  
  if (!product) return notFound()
  
  return <ProductForm categories={categories} initialData={product} isEdit />
}
