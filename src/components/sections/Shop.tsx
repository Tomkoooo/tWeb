"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Star,
  ArrowRight,
  ShoppingCart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { categories as mockCategories, products as mockProducts } from "@/lib/mock-data"

interface ShopProps {
  categories?: any[]
  products?: any[]
}

export function Shop({ 
  categories = mockCategories, 
  products = mockProducts 
}: ShopProps) {
  return (
    <section id="shop" className="py-32 bg-black px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-7xl font-heading font-black mb-6 text-white text-left uppercase">
              PROFESSZIONÁLIS <br />
              <span className="text-[#FF5500]">SZERSZÁM TARHÁZ</span>
            </h2>
            <p className="text-neutral-400 text-xl max-w-2xl leading-relaxed">
              Az ipari szintű elektromos berendezésektől a precíziós kéziszerszámokig. Nálunk minden szerszám a tartósság és az erő jelképe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black h-14 px-8 text-lg btn-krausz font-black">
              ÖSSZES TERMÉK <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Category Grid with Glass and Contrast */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative group h-[400px] overflow-hidden border border-white/5"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 p-10 flex flex-col justify-end items-start text-left">
                <h3 className="text-3xl font-heading font-black text-white mb-3 tracking-tighter uppercase">{category.name}</h3>
                <p className="text-neutral-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 line-clamp-2">
                  {category.description}
                </p>
                <Link href={`/categories/${category.slug}`}>
                  <Button size="sm" className="bg-[#FF5500] hover:bg-[#FF7722] text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 btn-krausz px-6 h-10 font-black">
                    FELFEDEZÉS <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Products Carousel */}
        <div className="space-y-16 py-10 border-t border-white/5">
          <div className="flex items-center gap-6">
            <h3 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Kiemelt Mestermunkák</h3>
            <div className="h-[2px] flex-grow bg-white/5" />
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="glass-card rounded-none overflow-hidden group border-white/5 h-full">
                      <div className="relative h-[320px] bg-neutral-900 overflow-hidden">
                        <ProductImage src={product.image} name={product.name} />
                        <Badge className="absolute top-6 left-6 bg-[#FF5500] text-white border-none rounded-none py-1.5 px-3 font-black text-[10px] tracking-[0.2em] shadow-xl">
                          {product.category}
                        </Badge>
                        <div className="absolute bottom-6 right-6 flex gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < Math.floor(product.rating) ? "fill-[#FFD700] text-[#FFD700]" : "text-white/10"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="p-8">
                        <Link href={`/products/${product.slug}`}>
                          <h4 className="text-white text-xl font-heading font-black mb-4 tracking-tighter group-hover:text-[#FF5500] transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                        </Link>
                        <div className="text-3xl font-black text-white mb-8">
                          {product.price.toLocaleString("hu-HU")} <span className="text-sm font-black text-[#FF5500]">Ft</span>
                        </div>
                        <Button className="w-full bg-transparent border-2 border-white/10 text-white hover:bg-[#FF5500] hover:border-[#FF5500] font-black h-14 btn-krausz transition-all flex gap-3">
                          <ShoppingCart className="w-5 h-5 text-[#FF5500] group-hover:text-white" />
                          KOSÁRBA TESZEM
                        </Button>
                      </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden lg:flex justify-end gap-3 mt-10">
              <CarouselPrevious className="relative left-0 translate-y-0 h-14 w-14 bg-white/5 border-white/10 text-white hover:bg-[#FF5500] hover:border-[#FF5500] rounded-none" />
              <CarouselNext className="relative right-0 translate-y-0 h-14 w-14 bg-white/5 border-white/10 text-white hover:bg-[#FF5500] hover:border-[#FF5500] rounded-none" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}

function ProductImage({ src, name }: { src: string; name: string }) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  return (
    <>
      {!isLoaded && <Skeleton className="absolute inset-0 z-10" />}
      <Image
        src={src}
        alt={name}
        fill
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "object-cover transition-all duration-700 group-hover:scale-105",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </>
  )
}
