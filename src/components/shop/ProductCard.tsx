"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star, ShoppingCart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { buildProductListingLines, getActiveVariants, hasVariants } from "@/lib/product-variants"
import { formatHuf, listingPriceSummary } from "@/lib/pricing"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"

import { useCartStore } from "@/store/useCartStore"

interface ProductCardProps {
  product: any
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [shopEnabled, setShopEnabled] = React.useState<boolean | null>(null)
  const router = useRouter()
  const addItem = useCartStore((state: any) => state.addItem)
  const variantProduct = hasVariants(product)
  const requiresVariantSelection = Boolean(product.requireVariantSelection) && variantProduct
  const activeVariants = getActiveVariants(product)
  const listingLines = buildProductListingLines(product)
  const showFromPrice = variantProduct && activeVariants.length > 1
  const {
    unitGross: finalPrice,
    unitNet,
    unitVat,
    vatPercent: vatPct,
    maxDiscount,
    compareGross,
  } = listingPriceSummary(listingLines, product.vatPercent)
  const ratingValue = typeof product.rating === "number" ? product.rating : 0

  React.useEffect(() => {
    const loadAvailability = async () => {
      try {
        const res = await fetch("/api/shop/availability")
        if (!res.ok) {
          setShopEnabled(false)
          return
        }
        const data = await res.json()
        setShopEnabled(Boolean(data.enabled))
      } catch {
        setShopEnabled(false)
      }
    }
    loadAvailability()
  }, [])

  const handleAddToCart = () => {
    if (shopEnabled === false) return
    if (requiresVariantSelection) {
      router.push(`/products/${product.slug}`)
      return
    }
    addItem({
      id: product._id.toString(),
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      price: finalPrice,
      image: mediaImageSrc(product.images?.[0]),
      quantity: 1,
      stock: product.stock,
      netPrice: product.netPrice,
      discount: product.discount,
      vatPercent: vatPct,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
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
        <Link href={`/products/${product.slug}`} className="block mb-2">
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

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleAddToCart}
              disabled={shopEnabled === false}
              className="w-full bg-primary border border-primary-foreground/35 text-white hover:bg-primary/90 hover:border-primary-foreground/90 font-black h-12 btn-krausz transition-all flex items-center justify-center gap-3 text-xs tracking-widest uppercase"
            >
              <ShoppingCart className="w-4 h-4" />
              {requiresVariantSelection ? "Variáns választása" : "Kosárba"}
            </Button>
            <Link href={`/products/${product.slug}`} className="w-full">
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
