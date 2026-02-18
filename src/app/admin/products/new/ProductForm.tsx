"use client"

import { useState } from "react"
import { Save, ArrowLeft, Info, Trash2, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultiImageUpload } from "@/components/admin/MultiImageUpload"
import { createProduct, updateProduct, deleteProduct } from "@/actions/admin-products"
import { cn } from "@/lib/utils"

interface ProductFormProps {
  categories: any[]
  initialData?: any
  isEdit?: boolean
}

export default function ProductForm({ categories, initialData, isEdit }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [isActive, setIsActive] = useState(initialData?.isActive ?? false)
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="hover:bg-white/5 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase italic text-white leading-none">
            {isEdit ? "Termék" : "Új"} <span className="text-accent underline decoration-accent/10 underline-offset-8">{isEdit ? "Szerkesztése" : "Termék"}</span>
          </h1>
        </div>
      </div>

      <form action={isEdit ? updateProduct.bind(null, initialData._id.toString()) : createProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
            <div className="flex items-center gap-2 text-white">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              <h2 className="text-xl font-bold italic uppercase tracking-wider">Alapadatok</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Termék Neve</label>
                  <Input 
                    name="name" 
                    required 
                    defaultValue={initialData?.name}
                    placeholder="Pl. Krausz Prémium Kalapács" 
                    className="bg-black border-white/10 h-12 text-white focus-visible:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Kategória</label>
                  <select 
                    name="category"
                    required
                    defaultValue={initialData?.category?._id?.toString() || initialData?.category?.toString() || ""}
                    className="w-full bg-black border border-white/10 rounded-md h-12 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Válasszon kategóriát...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id.toString()}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Termék Képei</label>
                <MultiImageUpload 
                  currentImages={images} 
                  onUpload={(imgs) => setImages(imgs)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Termék Leírása</label>
              <textarea 
                name="description" 
                rows={6}
                required
                defaultValue={initialData?.description}
                placeholder="Részletes leírás a termékről, jellemzőkkel és előnyökkel..." 
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
            <div className="flex items-center gap-2 text-white">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              <h2 className="text-xl font-bold italic uppercase tracking-wider">Árazás és Készlet</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Nettó Ár (Ft)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    name="netPrice" 
                    required
                    defaultValue={initialData?.netPrice}
                    placeholder="0" 
                    className="bg-black border-white/10 h-12 pl-12 text-white focus-visible:ring-accent"
                  />
                  <div className="absolute left-4 top-3.5 text-neutral-600 font-bold">Ft</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Kedvezmény (%)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    name="discount" 
                    defaultValue={initialData?.discount}
                    placeholder="0" 
                    className="bg-black border-white/10 h-12 pl-12 text-white focus-visible:ring-accent"
                  />
                  <div className="absolute left-4 top-3.5 text-neutral-600 font-bold">%</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Készlet (db)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    name="stock" 
                    required
                    defaultValue={initialData?.stock}
                    placeholder="0" 
                    className="bg-black border-white/10 h-12 pl-12 text-white focus-visible:ring-accent"
                  />
                  <div className="absolute left-4 top-3.5 text-neutral-600 font-bold">db</div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
            <div className="flex items-center gap-2 text-white">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              <h2 className="text-xl font-bold italic uppercase tracking-wider">SEO Beállítások</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Keresőoptimalizált Cím</label>
                  <p className="text-[10px] text-neutral-600 italic">Üresen hagyva a termék neve lesz</p>
                </div>
                <Input 
                  name="seo_title" 
                  defaultValue={initialData?.seo?.title}
                  placeholder="Oldal címe keresőkhöz" 
                  className="bg-black border-white/10 h-12 text-white focus-visible:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Meta Leírás</label>
                  <p className="text-[10px] text-neutral-600 italic">Üresen hagyva a leírás eleje lesz</p>
                </div>
                <textarea 
                  name="seo_description" 
                  rows={3}
                  defaultValue={initialData?.seo?.description}
                  placeholder="Rövid leírás Google keresésekhez..." 
                  className="w-full bg-black border border-white/10 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Kulcsszavak</label>
                <Input 
                  name="seo_keywords" 
                  defaultValue={initialData?.seo?.keywords?.join(", ")}
                  placeholder="szerszám, minőség, szakértelem (vesszővel elválasztva)" 
                  className="bg-black border-white/10 h-12 text-white focus-visible:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Ratings Section (Read-Only for Admin) */}
          {isEdit && initialData?.ratings && initialData.ratings.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
              <div className="flex items-center gap-2 text-white">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                <h2 className="text-xl font-bold italic uppercase tracking-wider">Vásárlói Vélemények</h2>
              </div>
              
              <div className="space-y-6">
                {initialData.ratings.map((rating: any, index: number) => (
                  <div key={index} className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-4 h-4",
                              i < rating.rating ? "text-accent fill-accent" : "text-white/10"
                            )} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(rating.createdAt).toLocaleDateString("hu-HU")}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-white/80 italic">"{rating.comment}"</p>
                    )}
                    <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest text-right">
                      {rating.user?.name || "Vendég Vásárló"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sticky top-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-6 text-white uppercase italic tracking-widest border-b border-white/5 pb-4">Státusz</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Aktív</p>
                    <p className="text-[10px] text-neutral-500 italic">Vásárolható-e</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none",
                      isActive ? "bg-accent" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                      isActive ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                  <input type="hidden" name="isActive" value={isActive.toString()} />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Látható</p>
                    <p className="text-[10px] text-neutral-500 italic">Megjelenik a listában</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none",
                      isVisible ? "bg-accent" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                      isVisible ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                  <input type="hidden" name="isVisible" value={isVisible.toString()} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-white uppercase italic tracking-widest border-b border-white/5 pb-4">Műveletek</h3>
              <div className="space-y-4">
                <Button type="submit" className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95">
                  <Save className="w-5 h-5" />
                  {isEdit ? "Módosítások Mentése" : "Termék Mentése"}
                </Button>
                <Link href="/admin/products" className="block">
                  <Button type="button" variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl uppercase tracking-widest text-xs font-bold">
                    Mégse
                  </Button>
                </Link>

                {isEdit && (
                  <div className="pt-8 mt-8 border-t border-white/5">
                    <Button 
                      formAction={() => deleteProduct(initialData._id.toString())}
                      type="submit" 
                      variant="ghost" 
                      className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/5 group font-bold px-0"
                    >
                      <Trash2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      Termék Törlése
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] text-neutral-500 italic leading-relaxed">
                  A mentés után a változtatások azonnal életbe lépnek. Az inaktív termékek nem vásárolhatóak meg, a nem látható termékek pedig nem jelennek meg a kategória listákban.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

