"use client"

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Tag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/store/useCartStore";
import {
  getActiveVariants,
  getVariantLabel,
  hasVariants,
  resolveProductView,
} from "@/lib/product-variants";

export function ProductDetail({ product, initialVariantId }: { product: any; initialVariantId?: string }) {
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId || "");
  const [activeImage, setActiveImage] = useState(product.images?.[0] || "");
  const [isAdded, setIsAdded] = useState(false);
  const [shopEnabled, setShopEnabled] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addItem = useCartStore((state: any) => state.addItem)

  const activeVariants = useMemo(() => getActiveVariants(product), [product]);
  const view = useMemo(() => resolveProductView(product, selectedVariantId), [product, selectedVariantId]);
  const discountAmount = view.discount || 0;
  const price = view.netPrice * 1.27;
  const finalPrice = price * (1 - discountAmount / 100);
  const selectedVariant = view.selectedVariant;
  const hasVariantOptions = hasVariants(product);
  const variantRequired = Boolean(product.requireVariantSelection) && hasVariantOptions;
  const canShowPriceAndStock = !variantRequired || Boolean(selectedVariant);
  const reviewCount = product.reviews?.length || 0;
  const averageRating = reviewCount
    ? product.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviewCount
    : 0;
  const roundedRating = Math.round(averageRating);

  useEffect(() => {
    setSelectedVariantId(initialVariantId || "");
  }, [initialVariantId]);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const res = await fetch("/api/shop/availability");
        if (!res.ok) {
          setShopEnabled(false);
          return;
        }
        const data = await res.json();
        setShopEnabled(Boolean(data.enabled));
      } catch {
        setShopEnabled(false);
      }
    };
    loadAvailability();
  }, []);

  useEffect(() => {
    setActiveImage(view.images?.[0] || "");
    setMainImageLoaded(false);
  }, [view.images]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const currentVariant = params.get("variant") || "";
    if ((selectedVariantId || "") === currentVariant) return;
    if (selectedVariantId) params.set("variant", selectedVariantId);
    else params.delete("variant");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }, [selectedVariantId, pathname, router, searchParams]);

  const handleAddToCart = () => {
    if (shopEnabled === false) return;
    if (variantRequired && !selectedVariant) {
      return;
    }
    const productId = product._id.toString();
    const lineId = selectedVariant ? `${productId}:${selectedVariant.id}` : productId;
    const variantLabel = selectedVariant ? getVariantLabel(selectedVariant) : "";
    addItem({
      id: lineId,
      productId,
      variantId: selectedVariant?.id,
      variantLabel,
      selectedAttributes: selectedVariant?.attributes || {},
      name: view.name,
      slug: product.slug,
      price: finalPrice,
      image: view.images?.[0] ? `/api/media/${view.images[0]}` : "/placeholder-product.jpg",
      quantity: 1,
      stock: view.stock,
      netPrice: view.netPrice,
      discount: view.discount
    })
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="container mx-auto px-4 py-32 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-neutral-900 border border-white/5 overflow-hidden group">
            {!mainImageLoaded && <Skeleton className="absolute inset-0 z-10" />}
            <Image
              src={activeImage ? `/api/media/${activeImage}` : "/placeholder-product.jpg"}
              alt={view.name}
              fill
              onLoad={() => setMainImageLoaded(true)}
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-105",
                mainImageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            {discountAmount > 0 && (
              <div className="absolute top-6 left-6 bg-primary text-white px-4 py-2 font-black uppercase tracking-widest text-xs z-10">
                Akció
              </div>
            )}
          </div>
          
          {view.images && view.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {view.images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative aspect-square bg-neutral-900 border overflow-hidden cursor-pointer transition-colors",
                    activeImage === img ? "border-primary" : "border-white/5 hover:border-primary/40"
                  )}
                >
                  <Image
                    src={`/api/media/${img}`}
                    alt={`${view.name} - ${idx + 1}`}
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
              {view.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < roundedRating ? "fill-accent text-primary" : "text-white/10"
                    )}
                  />
                ))}
              </div>
              <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest">
                {reviewCount > 0 ? `${averageRating.toFixed(1)} (${reviewCount} vélemény)` : "Nincs értékelés"}
              </span>
            </div>
          </div>
 
          <div className="mb-12">
            {canShowPriceAndStock ? (
              <>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-black text-white">
                    {Math.round(finalPrice).toLocaleString("hu-HU")} <span className="text-xl text-primary font-black">Ft</span>
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-2xl text-neutral-600 line-through">
                      {Math.round(price).toLocaleString("hu-HU")} Ft
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 text-sm italic font-medium">Bruttó ár (tartalmazza a 27% ÁFÁ-t)</p>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-2">
                  Készlet: {view.stock} db
                  {selectedVariant ? ` (variáns: ${getVariantLabel(selectedVariant)})` : ""}
                </p>
              </>
            ) : (
              <p className="text-neutral-400 text-sm font-black uppercase tracking-widest">
                Ez a termék csak variáns választással rendelhető.
              </p>
            )}
          </div>
 
          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-neutral-400 text-lg leading-relaxed">
              {view.description}
            </p>
          </div>
 
          {/* Tags / Keywords */}
          {view.seo?.keywords && view.seo.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {view.seo.keywords.map((tag: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-default">
                  <Tag className="w-3 h-3 text-primary" />
                  {tag}
                </div>
              ))}
            </div>
          )}

          {hasVariantOptions && (
            <div className="mb-10 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                {variantRequired ? "Variáns választása (kötelező)" : "Variáns választása (opcionális)"}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((variant: any) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "px-4 h-11 border text-xs font-black uppercase tracking-widest transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/10 text-white hover:border-primary/40"
                      )}
                    >
                      {getVariantLabel(variant)}
                    </button>
                  );
                })}
              </div>
              {!selectedVariant && variantRequired ? (
                <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
                  Kosárba helyezéshez válassz egy variánst.
                </p>
              ) : selectedVariant ? (
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                  Kiválasztva: {getVariantLabel(selectedVariant)}
                </p>
              ) : null}
            </div>
          )}
 
          <div className="space-y-6 mb-12">
            {shopEnabled === false ? (
              <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
                Jelenleg a rendelés leadás szünetel
              </p>
            ) : null}
            <Button 
              size="lg" 
              onClick={handleAddToCart}
              disabled={shopEnabled === false || isAdded || (variantRequired && !selectedVariant)}
              className={cn(
                "w-full h-16 font-black text-lg uppercase tracking-widest btn-krausz flex gap-4 transition-all duration-300",
                isAdded ? "bg-green-600 hover:bg-green-600 text-white" : "bg-primary hover:bg-primary/90 text-white",
                variantRequired && !selectedVariant ? "opacity-60 cursor-not-allowed" : ""
              )}
            >
              {isAdded ? <Check className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />}
              {isAdded ? "KOSÁRBA TÉVE" : "KOSÁRBA TESZEM"}
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">2 év garancia</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="w-8 h-8 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Express szállítás</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RotateCcw className="w-8 h-8 text-primary" />
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
                          i < review.rating ? "fill-accent text-primary" : "text-white/10"
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
