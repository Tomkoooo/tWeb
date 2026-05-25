"use client"

import { useMemo, useState } from "react"
import { Save, ArrowLeft, Info, Trash2, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultiImageUpload } from "@/components/admin/MultiImageUpload"
import { ProductVariantsEditor } from "@/components/admin/ProductVariantsEditor"
import { AdminPricePairFields } from "@/components/admin/AdminPricePairFields"
import { createProduct, updateProduct, deleteProduct } from "@/actions/admin-products"
import { cn } from "@/lib/utils"
import { netToGross } from "@/lib/pricing"
import { useAdminPricePair } from "@/hooks/useAdminPricePair"
import {
  deriveProductLevelFromVariants,
  normalizeAdminVariants,
  type AdminVariantInput,
  type AdminVariantRow,
} from "@/lib/admin-product-variants"

type IdLike = { toString(): string }
type CategoryLike = IdLike & { _id?: IdLike; name?: string }
type ProductRating = {
  rating: number
  createdAt: string | Date
  comment?: string
  user?: { name?: string } | IdLike
}
type ProductVariantOption = { name: string; values: string[] }
type ProductFormInitialData = {
  _id?: IdLike
  name?: string
  description?: string
  images?: string[]
  isActive?: boolean
  isVisible?: boolean
  vatPercent?: number
  netPrice?: number
  grossPrice?: number
  discount?: number
  stock?: number
  category?: CategoryLike
  variantOptions?: ProductVariantOption[]
  variants?: AdminVariantInput[]
  requireVariantSelection?: boolean
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  ratings?: ProductRating[]
  featuredListIndex?: number | null
}

interface ProductFormProps {
  categories: Array<{ _id: IdLike; name: string }>
  initialData?: ProductFormInitialData
  isEdit?: boolean
}

function getRatingUserName(user: ProductRating["user"]) {
  if (user && typeof user === "object" && "name" in user && typeof user.name === "string") {
    return user.name
  }
  return "VENDÉG VÁSÁRLÓ"
}

export default function ProductForm({ categories, initialData, isEdit }: ProductFormProps) {
  const productId = initialData?._id?.toString() || ""
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [isActive, setIsActive] = useState(initialData?.isActive ?? false)
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true)
  const [vatPercent, setVatPercent] = useState(Number(initialData?.vatPercent ?? 27))

  const initialNet = Number(initialData?.netPrice || 0)
  const initialGross =
    initialData?.grossPrice != null && initialData.grossPrice > 0
      ? Number(initialData.grossPrice)
      : netToGross(initialNet, Number(initialData?.vatPercent ?? 27))

  const productPrice = useAdminPricePair(initialNet, vatPercent, initialGross)

  const [variantsEnabled, setVariantsEnabled] = useState(
    (initialData?.variants?.length ?? 0) > 0 || (initialData?.variantOptions?.length ?? 0) > 0
  )
  const [requireVariantSelection, setRequireVariantSelection] = useState(
    Boolean(initialData?.requireVariantSelection)
  )
  const [editorVariants, setEditorVariants] = useState<AdminVariantRow[]>(() =>
    normalizeAdminVariants(
      initialData?.variants || [],
      initialNet
    )
  )

  const mandatoryVariants = variantsEnabled && requireVariantSelection
  const optionalVariants = variantsEnabled && !requireVariantSelection
  const simpleProduct = !variantsEnabled

  const derivedFromVariants = useMemo(
    () => deriveProductLevelFromVariants(editorVariants),
    [editorVariants]
  )

  const summaryGross = mandatoryVariants
    ? derivedFromVariants.grossPrice || netToGross(derivedFromVariants.netPrice, vatPercent)
    : productPrice.grossPrice
  const submitGrossPrice = summaryGross

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="hover:bg-white/5 text-neutral-400 hover:text-white rounded-none">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            {isEdit ? "TERMÉK" : "ÚJ"}{" "}
            <span className="admin-headline-accent">
              {isEdit ? "SZERKESZTÉSE" : "TERMÉK"}
            </span>
          </h1>
        </div>
      </div>

      <form
        action={isEdit ? updateProduct.bind(null, productId) : createProduct}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-none p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3 text-white">
              <div className="w-1.5 h-6 admin-section-marker" />
              <h2 className="text-xl font-heading font-black italic uppercase tracking-wider">ALAPADATOK</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Termék Neve</label>
                  <Input
                    name="name"
                    required
                    defaultValue={initialData?.name}
                    placeholder="TERMÉK NEVE"
                    className="bg-black border-white/5 h-12 text-white font-bold uppercase tracking-widest focus-visible:ring-primary rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Kategória</label>
                  <select
                    name="category"
                    required
                    defaultValue={initialData?.category?._id?.toString() || initialData?.category?.toString() || ""}
                    className="w-full bg-black border border-white/5 rounded-none h-12 px-3 text-white font-bold uppercase tracking-widest text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">VÁLASSZON KATEGÓRIÁT...</option>
                    {categories.map((cat) => (
                      <option key={cat._id.toString()} value={cat._id.toString()}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Termék Képei</label>
                <div className="bg-black/20 border border-white/5 p-4">
                  <MultiImageUpload currentImages={images} onUpload={(imgs) => setImages(imgs)} flexibleCrop />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Termék Leírása</label>
              <textarea
                name="description"
                rows={6}
                required
                defaultValue={initialData?.description}
                placeholder="RÉSZLETES LEÍRÁS..."
                className="w-full bg-black border border-white/5 rounded-none p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all leading-relaxed resize-none"
              />
            </div>
          </div>

          {simpleProduct && (
            <div className="bg-white/5 border border-white/10 rounded-none p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-3 text-white">
                <div className="w-1.5 h-6 admin-section-marker" />
                <h2 className="text-xl font-heading font-black italic uppercase tracking-wider">ÁRAZÁS ÉS KÉSZLET</h2>
              </div>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                A bruttó ár az, amit a vevő fizet. A nettó a számlázáshoz kerül mentésre.
              </p>
              <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-5">
                <AdminPricePairFields
                  netPrice={productPrice.netPrice}
                  grossPrice={productPrice.grossPrice}
                  vatPercent={vatPercent}
                  onNetChange={productPrice.setNetPrice}
                  onGrossChange={productPrice.setGrossPrice}
                  netName="netPrice"
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">ÁFA kulcs (%)</label>
                  <Input
                    type="number"
                    name="vatPercent"
                    min={0}
                    max={100}
                    step={1}
                    value={vatPercent}
                    onChange={(e) => setVatPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-primary rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Kedvezmény (%)</label>
                  <Input
                    type="number"
                    name="discount"
                    defaultValue={initialData?.discount}
                    placeholder="0"
                    className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-primary rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Készlet (DB)</label>
                  <Input
                    type="number"
                    name="stock"
                    required
                    defaultValue={initialData?.stock}
                    placeholder="0"
                    className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-primary rounded-none"
                  />
                </div>
              </div>
              <input type="hidden" name="grossPrice" value={productPrice.grossPrice} />
            </div>
          )}

          {optionalVariants && (
            <div className="bg-white/5 border border-white/10 rounded-none p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-3 text-white">
                <div className="w-1.5 h-6 admin-section-marker" />
                <h2 className="text-xl font-heading font-black italic uppercase tracking-wider">ALAP TERMÉK (VARIÁNS NÉLKÜL)</h2>
              </div>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                Ha a vevő nem választ variánst, ezek az árak és készlet érvényesek.
              </p>
              <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AdminPricePairFields
                  netPrice={productPrice.netPrice}
                  grossPrice={productPrice.grossPrice}
                  vatPercent={vatPercent}
                  onNetChange={productPrice.setNetPrice}
                  onGrossChange={productPrice.setGrossPrice}
                  netName="netPrice"
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Kedvezmény (%)</label>
                  <Input
                    type="number"
                    name="discount"
                    defaultValue={initialData?.discount}
                    className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-primary rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Készlet (DB)</label>
                  <Input
                    type="number"
                    name="stock"
                    required
                    defaultValue={initialData?.stock}
                    className="bg-black border-white/5 h-12 text-white font-black tracking-widest focus-visible:ring-primary rounded-none"
                  />
                </div>
              </div>
              <input type="hidden" name="grossPrice" value={productPrice.grossPrice} />
            </div>
          )}

          <ProductVariantsEditor
            initialOptions={initialData?.variantOptions || []}
            initialVariants={editorVariants}
            variants={editorVariants}
            defaultNetPrice={productPrice.netPrice}
            defaultGrossPrice={productPrice.grossPrice}
            vatPercent={vatPercent}
            onVatChange={setVatPercent}
            initialRequireVariantSelection={initialData?.requireVariantSelection || false}
            onModeChange={({ enabled, requireVariantSelection: req }) => {
              setVariantsEnabled(enabled)
              setRequireVariantSelection(req)
            }}
            onVariantsChange={setEditorVariants}
          />

          {mandatoryVariants ? (
            <>
              <input type="hidden" name="netPrice" value={derivedFromVariants.netPrice} />
              <input type="hidden" name="grossPrice" value={submitGrossPrice} />
              <input type="hidden" name="stock" value={derivedFromVariants.stock} />
              <input type="hidden" name="discount" value={derivedFromVariants.discount} />
            </>
          ) : null}

          <div className="bg-white/5 border border-white/10 rounded-none p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3 text-white">
              <div className="w-1.5 h-6 admin-section-marker" />
              <h2 className="text-xl font-heading font-black italic uppercase tracking-wider">SEO BEÁLLÍTÁSOK</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Keresőoptimalizált Cím</label>
                  <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Alapértelmezett: Terméknév</p>
                </div>
                <Input
                  name="seo_title"
                  defaultValue={initialData?.seo?.title}
                  placeholder="KERESŐKNEK..."
                  className="bg-black border-white/5 h-12 text-white font-bold uppercase tracking-widest focus-visible:ring-primary rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Meta Leírás</label>
                <textarea
                  name="seo_description"
                  rows={3}
                  defaultValue={initialData?.seo?.description}
                  placeholder="RÖVID LEÍRÁS..."
                  className="w-full bg-black border border-white/5 rounded-none p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">Kulcsszavak</label>
                <Input
                  name="seo_keywords"
                  defaultValue={initialData?.seo?.keywords?.join(", ")}
                  placeholder="KULCSSZAVAK..."
                  className="bg-black border-white/5 h-12 text-white font-bold uppercase tracking-widest focus-visible:ring-primary rounded-none"
                />
              </div>
            </div>
          </div>

          {isEdit && initialData?.ratings && initialData.ratings.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-none p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-3 text-white">
                <div className="w-1.5 h-6 admin-section-marker" />
                <h2 className="text-xl font-heading font-black italic uppercase tracking-wider">VÁSÁRLÓI VÉLEMÉNYEK</h2>
              </div>

              <div className="space-y-6">
                {initialData.ratings.map((rating, index) => (
                  <div key={index} className="p-5 bg-black/20 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < rating.rating ? "text-highlight fill-accent" : "text-white/10"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-black tracking-widest">
                        {new Date(rating.createdAt).toLocaleDateString("hu-HU")}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-white font-medium italic">&quot;{rating.comment}&quot;</p>
                    )}
                    <p className="text-[10px] text-neutral-600 uppercase font-black tracking-[0.2em] text-right">
                      {getRatingUserName(rating.user)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-none p-8 sticky top-24 space-y-10">
            <div className="space-y-8">
              <h3 className="text-lg font-heading font-black text-white uppercase italic tracking-widest border-b border-white/5 pb-4">STÁTUSZ</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-black/20 border border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AKTÍV</p>
                    <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-1">VÁSÁROLHATÓ-E</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "w-14 h-7 rounded-none p-1 transition-colors duration-200 focus:outline-none",
                      isActive ? "bg-primary" : "bg-neutral-800"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white transition-transform duration-200",
                        isActive ? "translate-x-7" : "translate-x-0"
                      )}
                    />
                  </button>
                  <input type="hidden" name="isActive" value={isActive.toString()} />
                </div>

                <div className="flex items-center justify-between p-5 bg-black/20 border border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">LÁTHATÓ</p>
                    <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-1">MEGJELENIK-E</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className={cn(
                      "w-14 h-7 rounded-none p-1 transition-colors duration-200 focus:outline-none",
                      isVisible ? "bg-primary" : "bg-neutral-800"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white transition-transform duration-200",
                        isVisible ? "translate-x-7" : "translate-x-0"
                      )}
                    />
                  </button>
                  <input type="hidden" name="isVisible" value={isVisible.toString()} />
                </div>

                <div className="space-y-2 p-5 bg-black/20 border border-white/5">
                  <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">
                    Kiemelt lista index (főoldal)
                  </label>
                  <Input
                    name="featuredListIndex"
                    type="number"
                    step={1}
                    defaultValue={
                      initialData?.featuredListIndex != null
                        ? String(initialData.featuredListIndex)
                        : ""
                    }
                    placeholder="Üres = nincs prioritás"
                    className="bg-black border-white/5 h-12 text-white font-mono rounded-none"
                  />
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                    Kisebb szám = előrébb a kiemelt szekcióban (kategória mód / egyedi lista).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-heading font-black text-white uppercase italic tracking-widest border-b border-white/5 pb-4">MŰVELETEK</h3>
              <div className="space-y-4">
                <Button type="submit" variant="krausz" className="w-full h-16 text-base tracking-[0.2em]">
                  <Save className="w-5 h-5" />
                  MENTÉS
                </Button>
                <Link href="/admin/products" className="block">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 border-white/10 text-white hover:bg-white/5 rounded-none uppercase tracking-[0.2em] text-[10px] font-black"
                  >
                    MÉGSE
                  </Button>
                </Link>

                {isEdit && (
                  <div className="pt-10 mt-10 border-t border-white/5">
                    <Button
                      formAction={() => deleteProduct(productId)}
                      type="submit"
                      variant="ghost"
                      className="w-full text-rose-500 hover:text-white hover:bg-rose-500/20 rounded-none font-black uppercase tracking-widest text-[10px] h-12"
                    >
                      <Trash2 className="w-5 h-5 mr-3" />
                      TERMÉK TÖRLÉSE
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-white/5 border border-white/10">
              <div className="flex items-start gap-4">
                <Info className="w-5 h-5 admin-icon-accent shrink-0 mt-0.5" />
                <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest leading-relaxed">
                  A MENTÉS UTÁN A VÁLTOZTATÁSOK AZONNAL ÉLETBE LÉPNEK A BOLTBAN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
