import type { ProductGridBlock } from "@/features/homepage-cms/types/block-types"

type ProductCard = {
  id: string
  name: string
  slug: string
  image: string
  price: number
}

export function ProductGridBlockView({
  block,
  products,
  categories,
}: {
  block: ProductGridBlock
  products: ProductCard[]
  categories: Array<{ id: string; name: string; slug: string }>
}) {
  return (
    <section className="py-20 border-b border-white/10">
      <div className="container mx-auto px-4 space-y-6">
        <h2 className="text-3xl font-black text-white">{block.data.title}</h2>
        <p className="text-neutral-400">{block.data.description}</p>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">{block.data.categoriesTitle}</h3>
          <p className="text-neutral-400">{block.data.categoriesDescription}</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category.id} className="px-3 py-1 border border-white/20 text-white text-xs">
                {category.name}
              </span>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, block.data.maxItems).map((product) => (
            <article key={product.id} className="border border-white/10 bg-white/5 p-3">
              <p className="text-white font-semibold">{product.name}</p>
              <p className="text-neutral-400 text-sm mt-1">{product.price.toLocaleString("hu-HU")} Ft</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
