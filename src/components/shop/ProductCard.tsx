"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Star, ShoppingCart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { QuickVariantSelector } from "@/components/shop/QuickVariantSelector"
import {
  buildProductListingLines,
  buildRegularProductListingLines,
  getActiveVariants,
  getLimitedPriceOffer,
  getVariantById,
  getVariantLabel,
  hasVariants,
  resolveProductView,
} from "@/lib/product-variants"
import { clampVatPercent, customerGrossFromNetWithDiscount, formatHuf, listingHasPriceRange, listingPriceSummary } from "@/lib/pricing"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"

import { useCartStore } from "@/store/useCartStore"
import { trackProductSelectFromListing } from "@/lib/analytics/product-events"

type ProductCardProduct = {
  _id: { toString(): string }
  name: string
  slug: string
  description?: string
  images?: string[]
  category?: { name?: string }
  rating?: number
  stock?: number
  netPrice: number
  grossPrice?: number
  discount?: number
  vatPercent?: number
  requireVariantSelection?: boolean
  variantOptions?: Array<{ name: string; values: string[] }>
  variants?: Array<{
    id: string
    attributes?: Record<string, string>
    nameOverride?: string
    descriptionOverride?: string
    netPrice: number
    grossPrice?: number
    discount?: number
    stock?: number
    isActive?: boolean
    isDefault?: boolean
    images?: string[]
    limitedPrice?: {
      enabled?: boolean
      limitQuantity?: number
      netPrice?: number
      grossPrice?: number
      reservedCount?: number
      soldCount?: number
      claimedCount?: number
    }
  }>
  limitedPrice?: {
    enabled?: boolean
    limitQuantity?: number
    netPrice?: number
    grossPrice?: number
    reservedCount?: number
    soldCount?: number
    claimedCount?: number
  }
}

interface ProductCardProps {
  product: unknown
  shopEnabled?: boolean
}

export function ProductCard({ product: productInput, shopEnabled = true }: ProductCardProps) {
  const product = productInput as ProductCardProduct
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isAdded, setIsAdded] = React.useState(false)
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const variantProduct = hasVariants(product)
  const requiresVariantSelection = Boolean(product.requireVariantSelection) && variantProduct
  const activeVariants = getActiveVariants(product)
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    () => activeVariants.find((variant) => variant.isDefault)?.id || activeVariants[0]?.id || ""
  )
  const selectedVariant = getVariantById(product, selectedVariantId)
  const limitedOffer = variantProduct
    ? selectedVariant
      ? getLimitedPriceOffer(product, selectedVariant.id)
      : null
    : getLimitedPriceOffer(product)
  const listingLines = buildProductListingLines(product)
  const regularListingLines = buildRegularProductListingLines(product)
  const showFromPrice = variantProduct && listingHasPriceRange(regularListingLines, product.vatPercent)
  const {
    unitGross: finalPrice,
    unitNet,
    unitVat,
    vatPercent: vatPct,
    maxDiscount,
    compareGross,
  } = listingPriceSummary(listingLines, product.vatPercent)
  const ratingValue = typeof product.rating === "number" ? product.rating : 0

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (shopEnabled === false) return
    if (requiresVariantSelection && !selectedVariant) {
      router.push(`/products/${product.slug}`)
      return
    }
    if (selectedVariant) {
      const productId = product._id.toString()
      const view = resolveProductView(product, selectedVariant.id)
      const vatPercent = clampVatPercent(product.vatPercent)
      addItem({
        id: `${productId}:${selectedVariant.id}`,
        productId,
        variantId: selectedVariant.id,
        variantLabel: getVariantLabel(selectedVariant),
        selectedAttributes: selectedVariant.attributes || {},
        name: view.name,
        slug: product.slug,
        price: customerGrossFromNetWithDiscount(
          Number(view.netPrice || 0),
          Number(view.discount || 0),
          vatPercent,
          view.grossPrice
        ),
        image: mediaImageSrc(view.images?.[0]),
        quantity: 1,
        stock: view.stock,
        netPrice: view.netPrice,
        discount: view.discount,
        vatPercent,
      })
      setIsAdded(true)
      window.setTimeout(() => setIsAdded(false), 2000)
      return
    }
    const view = resolveProductView(product)
    addItem({
      id: product._id.toString(),
      productId: product._id.toString(),
      name: view.name,
      slug: product.slug,
      price: customerGrossFromNetWithDiscount(
        Number(view.netPrice || 0),
        Number(view.discount || 0),
        vatPct,
        view.grossPrice
      ),
      image: mediaImageSrc(view.images?.[0]),
      quantity: 1,
      stock: view.stock,
      netPrice: view.netPrice,
      discount: view.discount,
      vatPercent: vatPct,
    })
    setIsAdded(true)
    window.setTimeout(() => setIsAdded(false), 2000)
  }

  const handleProductNavigate = () => {
    trackProductSelectFromListing(product, selectedVariantId || undefined)
  }

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-none overflow-hidden group border-white/5 h-full flex flex-col"
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-neutral-900 overflow-hidden">
        {!isLoaded && <Skeleton className="absolute inset-0 z-10" />}
        <FallbackImage
          src={mediaImageSrc(product.images?.[0])}
          alt={product.name}
          fill
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "object-cover transition-all duration-700 group-hover:scale-110",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 rounded-none py-1 px-2 font-black text-[9px] tracking-[0.2em] uppercase">
            {product.category?.name || "Termék"}
          </Badge>
          {requiresVariantSelection ? (
            <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 rounded-none py-1 px-2 font-black text-[9px] tracking-[0.2em] uppercase">
              Variánsos
            </Badge>
          ) : null}
          {maxDiscount > 0 && (
            <Badge className="bg-primary text-white border-none rounded-none py-1 px-2 font-black text-[9px] tracking-[0.2em] uppercase">
              -{maxDiscount}%
            </Badge>
          )}
        </div>

        {/* Rating Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-1 z-20 bg-black/40 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3",
                i < Math.round(ratingValue) ? "fill-accent text-primary-foreground" : "text-white/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col grow">
        <Link
          href={`/products/${product.slug}`}
          prefetch={false}
          className="block mb-2"
          onClick={handleProductNavigate}
        >
          <h4 className="text-white text-lg font-heading font-black tracking-tighter group-hover:text-primary-foreground transition-colors line-clamp-2 uppercase">
            {product.name}
          </h4>
        </Link>

        <div className="mt-auto pt-4 flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-white">
              {formatHuf(finalPrice)}<span className="text-xs font-black text-primary-foreground">{showFromPrice ? "-tól" : ""}</span>
            </span>
            {maxDiscount > 0 && (
              <span className="text-sm font-bold text-neutral-500 line-through">
                {formatHuf(compareGross)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
            Nettó {formatHuf(unitNet)} · ÁFA {formatHuf(unitVat)} ({vatPct}%)
          </p>
          {limitedOffer && !limitedOffer.exhausted ? (
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground">
              Első {limitedOffer.limitQuantity} db {formatHuf(limitedOffer.promoUnitGross)}, utána{" "}
              {formatHuf(limitedOffer.regularUnitGross)}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            {variantProduct ? (
              <QuickVariantSelector
                product={product}
                selectedVariantId={selectedVariantId}
                onVariantChange={setSelectedVariantId}
              />
            ) : null}
            <Button 
              type="button"
              onClick={handleAddToCart}
              disabled={shopEnabled === false}
              className="w-full bg-primary border border-primary-foreground/35 text-white hover:bg-primary/90 hover:border-primary-foreground/90 font-black h-12 btn-krausz transition-all flex items-center justify-center gap-3 text-xs tracking-widest uppercase"
            >
              {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {isAdded ? "Kosárban" : requiresVariantSelection && !selectedVariant ? "Variáns választása" : "Kosárba"}
            </Button>
            <Link
              href={`/products/${product.slug}`}
              prefetch={false}
              className="w-full"
              onClick={handleProductNavigate}
            >
              <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-none font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                Megtekintés
                <ArrowRight className="w-3 h-3 text-primary-foreground" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
