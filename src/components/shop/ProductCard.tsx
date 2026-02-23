"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star, ShoppingCart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { useCartStore } from "@/store/useCartStore"

interface ProductCardProps {
  product: any
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const addItem = useCartStore((state: any) => state.addItem)

  const finalPrice = product.netPrice * (1 - (product.discount || 0) / 100)

  const handleAddToCart = () => {
    addItem({
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      price: finalPrice,
      image: product.images?.[0] ? `/api/media/${product.images[0]}` : "/placeholder.jpg",
      quantity: 1,
      stock: product.stock,
      netPrice: product.netPrice,
      discount: product.discount
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
        <Image
          src={product.images?.[0] ? `/api/media/${product.images[0]}` : "/placeholder.jpg"}
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
          {product.discount > 0 && (
            <Badge className="bg-[#FF5500] text-white border-none rounded-none py-1 px-2 font-black text-[9px] tracking-[0.2em] uppercase">
              -{product.discount}%
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
                i < 4 ? "fill-[#FFD700] text-[#FFD700]" : "text-white/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="block mb-2">
          <h4 className="text-white text-lg font-heading font-black tracking-tighter group-hover:text-[#FF5500] transition-colors line-clamp-2 uppercase">
            {product.name}
          </h4>
        </Link>

        <div className="mt-auto pt-4 flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-white">
              {finalPrice.toLocaleString("hu-HU")} <span className="text-xs font-black text-[#FF5500]">FT</span>
            </span>
            {product.discount > 0 && (
              <span className="text-sm font-bold text-neutral-500 line-through">
                {product.netPrice.toLocaleString("hu-HU")} FT
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleAddToCart}
              className="flex-grow bg-[#FF5500] border border-[#FF5500] text-white hover:bg-[#FF7722] hover:border-[#FF7722] font-black h-12 btn-krausz transition-all flex items-center justify-center gap-3 text-xs tracking-widest uppercase"
            >
              <ShoppingCart className="w-4 h-4" />
              Kosárba
            </Button>
            <Link href={`/products/${product.slug}`} className="flex-grow">
              <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-none font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                Megtekintés
                <ArrowRight className="w-3 h-3 text-[#FF5500]" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
