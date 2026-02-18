"use client"

import { useState } from "react"
import { Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { createCategory, updateCategory, deleteCategory } from "@/actions/admin-categories"

interface CategoryFormProps {
  categories: any[]
  initialData?: any
  isEdit?: boolean
}

export default function CategoryForm({ categories, initialData, isEdit }: CategoryFormProps) {
  const [imageUrl, setImageUrl] = useState(initialData?.image || "")

  // Filter out the current category from the list of possible parents if we're editing
  const possibleParents = isEdit 
    ? categories.filter((cat: any) => cat._id.toString() !== initialData._id.toString())
    : categories

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon" className="hover:bg-white/5 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase italic text-white leading-none">
            {isEdit ? "Kategória" : "Új"} <span className="text-accent underline decoration-accent/10 underline-offset-8">{isEdit ? "Szerkesztése" : "Kategória"}</span>
          </h1>
        </div>
      </div>

      <form action={isEdit ? updateCategory.bind(null, initialData._id.toString()) : createCategory} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold italic uppercase tracking-wider flex items-center gap-2 text-white">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              Alapadatok
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Kategória Neve</label>
              <Input 
                name="name" 
                required 
                defaultValue={initialData?.name}
                placeholder="Pl. Kézi Szerszámok" 
                className="bg-black border-white/10 h-12 text-white focus-visible:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Szülő Kategória</label>
                <select 
                  name="parent"
                  defaultValue={initialData?.parent?._id?.toString() || initialData?.parent?.toString() || ""}
                  className="w-full bg-black border border-white/10 rounded-md h-12 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Nincs (Főkategória)</option>
                  {possibleParents.map((cat: any) => (
                    <option key={cat._id} value={cat._id.toString()}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Kategória Képe</label>
                <ImageUpload currentImage={imageUrl} onUpload={(filename) => setImageUrl(filename)} />
                <input type="hidden" name="image" value={imageUrl} />
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold italic uppercase tracking-wider flex items-center gap-2 text-white">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              SEO Beállítások
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Meta Cím</label>
              <Input 
                name="seo_title" 
                defaultValue={initialData?.seo?.title}
                placeholder="Oldal címe keresőknek" 
                className="bg-black border-white/10 h-12 text-white focus-visible:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Meta Leírás</label>
              <textarea 
                name="seo_description" 
                rows={3}
                defaultValue={initialData?.seo?.description}
                placeholder="Rövid leírás a kategóriáról" 
                className="w-full bg-black border border-white/10 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 block uppercase tracking-widest">Kulcsszavak</label>
              <Input 
                name="seo_keywords" 
                defaultValue={initialData?.seo?.keywords?.join(", ")}
                placeholder="szerszám, kalapács, minőség (vesszővel elválasztva)" 
                className="bg-black border-white/10 h-12 text-white focus-visible:ring-accent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sticky top-8">
            <h3 className="text-lg font-bold mb-6 text-white uppercase italic tracking-widest border-b border-white/5 pb-4">Műveletek</h3>
            <div className="space-y-4">
              <Button type="submit" className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95">
                <Save className="w-5 h-5" />
                {isEdit ? "Módosítások Mentése" : "Mentés"}
              </Button>
              <Link href="/admin/categories">
                <Button type="button" variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl uppercase tracking-widest text-xs font-bold">
                  Mégse
                </Button>
              </Link>

              {isEdit && (
                <div className="pt-8 mt-8 border-t border-white/5">
                  <Button 
                    formAction={() => deleteCategory(initialData._id.toString())}
                    type="submit" 
                    variant="ghost" 
                    className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/5 group font-bold px-0"
                  >
                    <Trash2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Kategória Törlése
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
