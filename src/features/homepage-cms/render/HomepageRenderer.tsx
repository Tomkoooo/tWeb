"use client"

import type { HomepageBlock } from "@/features/homepage-cms/types/block-types"
import { getView } from "@/features/homepage-cms/registry/block-registry"

type Props = {
  blocks: HomepageBlock[]
  reviews: Array<{ id: string; name: string; role: string; content: string; rating: number; avatar: string }>
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    image: string
    category: string
    rating: number
    hasVariants: boolean
    requireVariantSelection: boolean
  }>
  categories: Array<{ id: string; name: string; description: string; image: string; slug: string }>
  company: { name: string; address: string; phone: string; email: string }
}

export function HomepageRenderer({ blocks, reviews, products, categories, company }: Props) {
  return (
    <>
      {blocks.filter((block) => block.enabled !== false).map((block) => {
        const Component = getView(block.type)
        if (!Component) return null
        const selectedProducts =
          block.type === "productGrid"
            ? products
                .filter((product) =>
                  (block.data.selectedProductIds as string[]).length
                    ? (block.data.selectedProductIds as string[]).includes(product.id)
                    : true
                )
                .map((product) => ({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  image: product.image,
                  price: product.price,
                }))
            : []
        const props = {
          block,
          products: selectedProducts,
          reviews,
          categories,
          company,
        } as unknown as Record<string, unknown>
        return <Component key={block.id} {...props} />
      })}
    </>
  )
}
