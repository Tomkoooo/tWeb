import { ProductDetail } from "@/app/products/[slug]/ProductDetail"
import type { RenderProps, PdpPageDeps } from "@/templates/types"
import type { PdpContent } from "./schema"

export function PdpRender({
  deps,
}: RenderProps<PdpContent, PdpPageDeps>) {
  return (
    <div className="bg-background text-foreground">
      <ProductDetail
        product={deps.product as never}
        initialVariantId={deps.selectedVariantId}
      />
    </div>
  )
}
