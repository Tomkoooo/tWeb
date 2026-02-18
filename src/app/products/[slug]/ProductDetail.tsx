"use client"

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetail({ product }: { product: any }) {
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(product.images?.[0] || "");

  const discountAmount = product.discount || 0;
  const price = product.netPrice * 1.27;
  const finalPrice = price - discountAmount;

  return (
    <div className="container mx-auto px-4 py-32 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-neutral-900 border border-white/5 overflow-hidden group">
            {!mainImageLoaded && <Skeleton className="absolute inset-0 z-10" />}
            <Image
              src={activeImage ? `/api/media/${activeImage}` : "/placeholder-product.jpg"}
              alt={product.name}
              fill
              onLoad={() => setMainImageLoaded(true)}
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-105",
                mainImageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            {discountAmount > 0 && (
              <div className="absolute top-6 left-6 bg-accent text-white px-4 py-2 font-black uppercase tracking-widest text-xs z-10">
                Akció
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative aspect-square bg-neutral-900 border overflow-hidden cursor-pointer transition-colors",
                    activeImage === img ? "border-accent" : "border-white/5 hover:border-accent/40"
                  )}
                >
                  <Image
                    src={`/api/media/${img}`}
                    alt={`${product.name} - ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <Badge className="bg-white/5 text-neutral-400 border-none rounded-none py-1 px-3 mb-6 font-bold uppercase tracking-widest text-[10px]">
              {product.category?.name || "Kategória nélkül"}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-black mb-6 uppercase tracking-tighter leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < 4 ? "fill-accent text-accent" : "text-white/10"
                    )}
                  />
                ))}
              </div>
              <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest">
                ({product.reviews?.length || 0} Vélemény)
              </span>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-5xl font-black text-white">
                {Math.round(finalPrice).toLocaleString("hu-HU")} <span className="text-xl text-accent font-black">Ft</span>
              </span>
              {discountAmount > 0 && (
                <span className="text-2xl text-neutral-600 line-through">
                  {Math.round(price).toLocaleString("hu-HU")} Ft
                </span>
              )}
            </div>
            <p className="text-neutral-500 text-sm italic font-medium">Bruttó ár (tartalmazza a 27% ÁFÁ-t)</p>
          </div>

          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-neutral-400 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Tags / Keywords */}
          {product.seo?.keywords && product.seo.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {product.seo.keywords.map((tag: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-default">
                  <Tag className="w-3 h-3 text-accent" />
                  {tag}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-6 mb-12">
            <Button size="lg" className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-black text-lg uppercase tracking-widest btn-krausz flex gap-4">
              <ShoppingCart className="w-6 h-6" />
              KOSÁRBA TESZEM
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="w-8 h-8 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">2 év garancia</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="w-8 h-8 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Express szállítás</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RotateCcw className="w-8 h-8 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">30 napos csere</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-32 pt-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl font-heading font-black mb-4 uppercase tracking-tighter">Vásárlói Vélemények</h2>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Valódi tapasztalatok a mesterektől</p>
          </div>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs h-12 px-8">
            Vélemény írása
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review: any) => (
              <div key={review._id} className="bg-white/5 p-10 border border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{review.user?.name || "Vendég"}</h4>
                    <p className="text-neutral-500 text-[10px] font-bold">{new Date(review.createdAt).toLocaleDateString("hu-HU")}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < review.rating ? "fill-accent text-accent" : "text-white/10"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-400 leading-relaxed italic">
                  "{review.description}"
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-20 bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-neutral-500 font-black uppercase tracking-[0.2em] text-sm">Még nem érkezett vélemény ehhez a termékhez.</p>
              <p className="text-neutral-600 text-xs italic">Legyen Ön az első, aki értékeli!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
