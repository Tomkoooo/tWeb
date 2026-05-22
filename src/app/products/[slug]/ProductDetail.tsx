"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Star,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Check,
} from "lucide-react"
import { MediaLightbox, useMediaLightbox, type MediaLightboxItem } from "@/components/common/MediaLightbox"
import { MediaZoomButton } from "@/components/common/MediaZoomButton"
import { mediaAspectVariant, mediaFrameClassName, type MediaFrameVariant } from "@/lib/media-aspect"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/store/useCartStore"
import {
  getActiveVariants,
  getVariantById,
  getVariantLabel,
  hasVariants,
  resolveProductView,
} from "@/lib/product-variants"
import {
  formatHuf,
  customerGrossFromNetWithDiscount,
  customerUnitGross,
  priceBreakdownFromGross,
  clampVatPercent,
} from "@/lib/pricing"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import type { PdpEditorialPlacement } from "@/templates/types"
import { EditableDocText } from "@/features/template-cms/primitives/EditableDocText"
import { useSurfaceDocEdit } from "@/features/template-cms/surface-doc-edit-context"

export type ProductDetailEditorial = {
  eyebrow?: string
  title?: string
  body?: string
  highlights?: Array<{ label: string; detail: string }>
  supportTitle?: string
  supportBody?: string
  faq?: Array<{ question: string; answer: string }>
  ctaLabel?: string
  addedLabel?: string
}

export function ProductDetail({
  product,
  initialVariantId,
  editorial,
  introPlacement = "aboveGrid",
  buyColumnFirst = false,
}: {
  // Product document shape from Mongo varies; template shell only forwards server payload.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any
  initialVariantId?: string
  editorial?: ProductDetailEditorial
  /** Defaults to legacy order (intro above gallery). Story-style templates prefer `belowHero`. */
  introPlacement?: PdpEditorialPlacement
  /** Editorial templates: lead with price / CTA column on desktop. */
  buyColumnFirst?: boolean
}) {
  const [loadedImageKeys, setLoadedImageKeys] = useState<Record<string, true>>({})
  const [frameByImageKey, setFrameByImageKey] = useState<Record<string, MediaFrameVariant>>({})
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId || "")
  const [activeImage, setActiveImage] = useState<string>(product.images?.[0] || "")
  const [isAdded, setIsAdded] = useState(false)
  const [shopEnabled, setShopEnabled] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addItem = useCartStore((state: any) => state.addItem)

  const activeVariants = useMemo(() => getActiveVariants(product), [product])
  const view = useMemo(
    () => resolveProductView(product, selectedVariantId),
    [product, selectedVariantId]
  )
  const discountAmount = view.discount || 0
  const vatPct = clampVatPercent(product.vatPercent)
  const price = customerUnitGross(view.netPrice, vatPct, view.grossPrice)
  const finalPrice = customerGrossFromNetWithDiscount(
    view.netPrice,
    discountAmount,
    vatPct,
    view.grossPrice
  )
  const priceBreakdown = priceBreakdownFromGross(finalPrice, 1, vatPct)
  const selectedVariant = view.selectedVariant
  const displayImages = useMemo(() => {
    const variant = getVariantById(product, selectedVariantId)
    const variantImages = (variant?.images || []).filter((img: string) => Boolean(img?.trim()))
    if (variantImages.length > 0) return variantImages
    return (product.images || []).filter((img: string) => Boolean(img?.trim()))
  }, [product, selectedVariantId])

  const gallerySignature = displayImages.join("\u0000")

  const galleryImages = useMemo<MediaLightboxItem[]>(
    () =>
      displayImages.map((img: string, idx: number) => ({
        src: img,
        alt: idx === 0 ? view.name : `${view.name} – ${idx + 1}`,
      })),
    [displayImages, view.name]
  )
  const lightbox = useMediaLightbox({ images: galleryImages })
  const activeLightboxIndex = Math.max(
    0,
    galleryImages.findIndex((item) => item.src === activeImage)
  )
  const hasVariantOptions = hasVariants(product)
  const variantRequired = Boolean(product.requireVariantSelection) && hasVariantOptions
  const canShowPriceAndStock = !variantRequired || Boolean(selectedVariant)
  const cms = useSurfaceDocEdit()
  const mainImageLoaded = activeImage ? Boolean(loadedImageKeys[activeImage]) : true
  const mainFrameVariant = activeImage
    ? frameByImageKey[activeImage] || "square"
    : "square"

  const reviewCount = product.reviews?.length || 0
  const averageRating = reviewCount
    ? product.reviews.reduce(
        (sum: number, review: { rating?: number }) => sum + (review.rating || 0),
        0
      ) / reviewCount
    : 0
  const roundedRating = Math.round(averageRating)

  const cta = editorial?.ctaLabel || "KOSÁRBA TESZEM"
  const added = editorial?.addedLabel || "KOSÁRBA TÉVE"

  useEffect(() => {
    // Sync deep-linked variant (?variant=) and server prop into pickers — intentional prop→state hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep variant UI aligned with URL + SSR props
    setSelectedVariantId(initialVariantId || "")
  }, [initialVariantId])

  useEffect(() => {
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

  useEffect(() => {
    // Only change preview when the available image set actually changes — keep current if still valid.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync active thumb when gallery set changes
    setActiveImage((prev) => {
      if (prev && displayImages.includes(prev)) return prev
      return displayImages[0] || ""
    })
  }, [gallerySignature, displayImages])

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    const currentVariant = params.get("variant") || ""
    if ((selectedVariantId || "") === currentVariant) return
    if (selectedVariantId) params.set("variant", selectedVariantId)
    else params.delete("variant")
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`)
  }, [selectedVariantId, pathname, router, searchParams])

  const handleAddToCart = () => {
    if (shopEnabled === false) return
    if (variantRequired && !selectedVariant) {
      return
    }
    const productId = product._id.toString()
    const lineId = selectedVariant ? `${productId}:${selectedVariant.id}` : productId
    const variantLabel = selectedVariant ? getVariantLabel(selectedVariant) : ""
    addItem({
      id: lineId,
      productId,
      variantId: selectedVariant?.id,
      variantLabel,
      selectedAttributes: selectedVariant?.attributes || {},
      name: view.name,
      slug: product.slug,
      price: finalPrice,
      image: mediaImageSrc(view.images?.[0]),
      quantity: 1,
      stock: view.stock,
      netPrice: view.netPrice,
      discount: view.discount,
      vatPercent: vatPct,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const showEditorialIntro =
    editorial &&
    (Boolean(editorial.eyebrow?.trim()) ||
      Boolean(editorial.title?.trim()) ||
      Boolean(editorial.body?.trim()))

  const faqItems = editorial?.faq?.filter((f) => f.question?.trim() && f.answer?.trim()) ?? []
  const faqPreviewSlots = cms.enabled ? [0, 1] : faqItems.map((_, idx) => idx)

  const showIntroZone = cms.enabled || showEditorialIntro

  const editorialIntroEl =
    showIntroZone && editorial ? (
      <div className="space-y-4 text-center lg:mx-0 lg:max-w-2xl lg:text-left">
        {(editorial!.eyebrow?.trim() || cms.enabled) && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
            {cms.enabled ? (
              <EditableDocText path="editorial.eyebrow" value={editorial!.eyebrow ?? ""} />
            ) : (
              editorial!.eyebrow
            )}
          </p>
        )}
        {(editorial!.title?.trim() || cms.enabled) && (
          <p className="text-2xl font-semibold tracking-tight">
            {cms.enabled ? (
              <EditableDocText path="editorial.title" value={editorial!.title ?? ""} />
            ) : (
              editorial!.title
            )}
          </p>
        )}
        {(editorial!.body?.trim() || cms.enabled) && (
          <div className="text-muted-foreground leading-relaxed">
            {cms.enabled ? (
              <EditableDocText
                path="editorial.body"
                value={editorial!.body ?? ""}
                multiline
              />
            ) : (
              editorial!.body
            )}
          </div>
        )}
      </div>
    ) : null

  const showHighlightsZone =
    cms.enabled || Boolean(editorial?.highlights?.some((h) => h.label?.trim() || h.detail?.trim()))

  const highlightIndices = cms.enabled
    ? [0, 1, 2]
    : editorial?.highlights
        ?.map((h, i) => ({ h, i }))
        .filter(({ h }) => Boolean(h.label?.trim() || h.detail?.trim()))
        .map(({ i }) => i) ?? []

  const editorialHighlightsEl =
    showHighlightsZone && editorial ? (
      <div className="grid gap-3 sm:grid-cols-3">
        {highlightIndices.map((i) => {
          const h = editorial.highlights?.[i] ?? { label: "", detail: "" }
          if (!cms.enabled && !(h.label.trim() || h.detail.trim())) return null
          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-muted/40 px-4 py-4 text-left"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                {cms.enabled ? (
                  <EditableDocText
                    path={`editorial.highlights.${i}.label`}
                    value={h.label ?? ""}
                  />
                ) : (
                  h.label
                )}
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-snug">
                {cms.enabled ? (
                  <EditableDocText
                    path={`editorial.highlights.${i}.detail`}
                    value={h.detail ?? ""}
                    multiline
                  />
                ) : (
                  h.detail
                )}
              </p>
            </div>
          )
        })}
      </div>
    ) : null

  return (
    <div className="container mx-auto px-4 pb-24 pt-36 animate-in fade-in duration-700 text-foreground md:pb-32 md:pt-40">
      {introPlacement === "aboveGrid" && editorialIntroEl ? (
        <div className="mb-14">{editorialIntroEl}</div>
      ) : null}

      {introPlacement === "aboveGrid" && editorialHighlightsEl ? (
        <div className="mb-14">{editorialHighlightsEl}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        <div className={cn("space-y-6", buyColumnFirst && "lg:order-2")}>
          <div
            className={cn(
              "group relative min-h-72 w-full overflow-hidden rounded-3xl border border-border bg-muted",
              mediaFrameClassName(mainFrameVariant)
            )}
          >
            {!mainImageLoaded && <Skeleton className="absolute inset-0 z-10" />}
            <button
              type="button"
              onClick={() => lightbox.openAt(activeLightboxIndex >= 0 ? activeLightboxIndex : 0)}
              className="absolute inset-0 z-1 cursor-zoom-in"
              aria-label="Termékkép nagyítása"
            />
            <FallbackImage
              src={mediaImageSrc(activeImage)}
              alt={view.name}
              fill
              onLoad={(event) => {
                if (!activeImage) return
                const img = event.currentTarget
                const frame = mediaAspectVariant(img.naturalWidth, img.naturalHeight)
                setLoadedImageKeys((prev) =>
                  prev[activeImage] ? prev : { ...prev, [activeImage]: true }
                )
                setFrameByImageKey((prev) =>
                  prev[activeImage] ? prev : { ...prev, [activeImage]: frame }
                )
              }}
              className={cn(
                "pointer-events-none object-contain transition-opacity duration-500",
                mainImageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            <MediaZoomButton
              onClick={() => lightbox.openAt(activeLightboxIndex >= 0 ? activeLightboxIndex : 0)}
            />
            {discountAmount > 0 ? (
              <div className="pointer-events-none absolute left-6 top-6 z-10 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                Akció
              </div>
            ) : null}
          </div>

          {displayImages.length > 1 ? (
            <div className="grid grid-cols-4 gap-4">
              {displayImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  onDoubleClick={() => lightbox.openAt(idx)}
                  className={cn(
                    "group/thumb relative aspect-square cursor-pointer overflow-hidden rounded-2xl border bg-muted transition-colors",
                    activeImage === img
                      ? "border-primary-foreground/35 ring-2 ring-primary-foreground/20"
                      : "border-border hover:border-primary-foreground/40"
                  )}
                >
                  <FallbackImage
                    src={mediaImageSrc(img)}
                    alt={`${view.name} – ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover/thumb:opacity-100 group-hover/thumb:bg-black/35">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                      Nagyítás
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={cn("flex flex-col", buyColumnFirst && "lg:order-1")}>
          <div className="mb-8">
            <Badge className="mb-6 rounded-full border-transparent bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {product.category?.name || "Kategória"}
            </Badge>
            <h1 className="mb-6 font-heading text-4xl font-semibold uppercase leading-tight tracking-tighter md:text-5xl lg:normal-case lg:text-6xl">
              {view.name}
            </h1>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < roundedRating ? "fill-accent text-accent" : "text-muted opacity-40"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {reviewCount > 0
                  ? `${averageRating.toFixed(1)} (${reviewCount} értékelés)`
                  : "Még nincs értékelés"}
              </span>
            </div>
          </div>

          <div className="mb-12">
            {canShowPriceAndStock ? (
              <>
                <div className="mb-2 flex items-baseline gap-4">
                  <span className="text-5xl font-semibold">{formatHuf(finalPrice)}</span>
                  {discountAmount > 0 ? (
                    <span className="text-2xl text-muted-foreground line-through">
                      {formatHuf(price)}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-medium italic text-muted-foreground">
                  Bruttó · Nettó {formatHuf(priceBreakdown.unitNet)} · ÁFA{" "}
                  {formatHuf(priceBreakdown.unitVat)} ({priceBreakdown.vatPercent}%)
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Készlet: {view.stock}
                  {selectedVariant ? ` (${getVariantLabel(selectedVariant)})` : ""}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Válassz variánst az ár megtekintéséhez és a kosárba helyezéshez.
              </p>
            )}
          </div>

          <div className="mb-12 max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">{view.description}</p>
          </div>

          {view.seo?.keywords && view.seo.keywords.length > 0 ? (
            <div className="mb-12 flex flex-wrap gap-2">
              {view.seo.keywords.map((tag: string, i: number) => (
                <div
                  key={i}
                  className="flex cursor-default items-center gap-1.5 rounded-full border border-border bg-muted/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Tag className="h-3 w-3 text-primary-foreground" />
                  {tag}
                </div>
              ))}
            </div>
          ) : null}

          {hasVariantOptions ? (
            <div className="mb-10 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {variantRequired ? "Variáns kiválasztása (kötelező)" : "Variáns kiválasztása (opcionális)"}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "h-11 border px-4 text-xs font-semibold uppercase tracking-widest transition-colors",
                        isSelected
                          ? "border-primary-foreground/35 bg-primary/10 text-primary-foreground"
                          : "border-border text-foreground hover:border-primary-foreground/40"
                      )}
                    >
                      {getVariantLabel(variant as never)}
                    </button>
                  )
                })}
              </div>
              {!selectedVariant && variantRequired ? (
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                  Válassz variánst a termék kosárba helyezéséhez.
                </p>
              ) : selectedVariant ? (
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Kiválasztva: {getVariantLabel(selectedVariant)}
                </p>
              ) : null}
            </div>
          ) : null}

          {(cms.enabled || editorial?.supportTitle || editorial?.supportBody) && editorial ? (
            <div className="mb-10 rounded-2xl border border-border bg-muted/30 px-6 py-5">
              <p className="text-sm font-semibold">
                {cms.enabled ? (
                  <EditableDocText
                    path="editorial.supportTitle"
                    value={editorial.supportTitle ?? ""}
                  />
                ) : (
                  editorial.supportTitle
                )}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {cms.enabled ? (
                  <EditableDocText
                    path="editorial.supportBody"
                    value={editorial.supportBody ?? ""}
                    multiline
                  />
                ) : (
                  editorial.supportBody
                )}
              </p>
            </div>
          ) : null}

          <div className="mb-12 space-y-6">
            {shopEnabled === false ? (
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Ordering is paused right now.
              </p>
            ) : null}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={
                shopEnabled === false ||
                isAdded ||
                (variantRequired && !selectedVariant)
              }
              className={cn(
                "flex h-16 w-full gap-4 rounded-xl text-lg font-semibold uppercase tracking-widest transition-all duration-300",
                isAdded
                  ? "bg-green-600 text-white hover:bg-green-600"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
                variantRequired && !selectedVariant ? "cursor-not-allowed opacity-60" : ""
              )}
            >
              {isAdded ? <Check className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
              {isAdded
                ? cms.enabled ? (
                  <EditableDocText
                    path="editorial.addedLabel"
                    value={editorial?.addedLabel ?? ""}
                    placeholder="Hozzáadva felirat"
                  />
                ) : (
                  added
                )
                : cms.enabled ? (
                  <EditableDocText path="ctaLabel" value={cta} placeholder="CTA felirat" />
                ) : (
                  cta
                )}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-border pt-12 md:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground">
                Warranty
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <Truck className="h-8 w-8 text-primary-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground">
                Fast shipping
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <RotateCcw className="h-8 w-8 text-primary-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground">
                Easy returns
              </span>
            </div>
          </div>
        </div>
      </div>

      {introPlacement === "belowHero" && (editorialIntroEl || editorialHighlightsEl) ? (
        <div className="mt-14 flex flex-col gap-14 lg:mt-24">
          {editorialIntroEl}
          {editorialHighlightsEl}
        </div>
      ) : null}

      <div className="mt-24 border-t border-border pt-16 md:mt-32 md:pt-24">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="mb-4 font-heading text-3xl font-semibold uppercase tracking-tighter md:text-4xl">
              Customer reviews
            </h2>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Verified purchases and honest feedback
            </p>
          </div>
          <Button
            variant="outline"
            className="h-12 rounded-full border-border px-8 text-xs font-semibold uppercase tracking-widest"
          >
            Write a review
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map(
              (review: {
                _id: string
                rating?: number
                description?: string
                createdAt?: string
                user?: { name?: string }
              }) => (
              <div
                key={review._id}
                className="group relative overflow-hidden border border-border bg-muted/40 p-10"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h4 className="mb-1 font-semibold uppercase tracking-widest text-foreground">
                      {review.user?.name || "Guest"}
                    </h4>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < (review.rating ?? 0)
                            ? "fill-accent text-accent"
                            : "text-muted opacity-30"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="italic leading-relaxed text-muted-foreground">
                  &ldquo;{review.description}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center gap-4 border border-dashed border-border bg-muted/20 py-20 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                No reviews for this product yet.
              </p>
              <p className="text-xs italic text-muted-foreground">
                Share your experience to help others choose.
              </p>
            </div>
          )}
        </div>
      </div>

      {(faqItems.length > 0 || cms.enabled) ? (
        <div className="mt-24 border-t border-border pt-16 md:mt-28">
          <h2 className="mb-10 text-center font-heading text-3xl font-semibold md:text-left">
            FAQ
          </h2>
          <dl className="mx-auto max-w-3xl space-y-6">
            {faqPreviewSlots.map((slotIdx) => {
              const item = cms.enabled
                ? editorial?.faq?.[slotIdx] ?? { question: "", answer: "" }
                : faqItems[slotIdx]
              if (!item) return null
              if (!cms.enabled && (!item.question?.trim() || !item.answer?.trim())) return null
              return (
                <div
                  key={slotIdx}
                  className="rounded-2xl border border-border bg-muted/30 px-6 py-5"
                >
                  <dt className="font-semibold text-foreground">
                    {cms.enabled ? (
                      <EditableDocText
                        path={`editorial.faq.${slotIdx}.question`}
                        value={item.question ?? ""}
                      />
                    ) : (
                      item.question
                    )}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cms.enabled ? (
                      <EditableDocText
                        path={`editorial.faq.${slotIdx}.answer`}
                        value={item.answer ?? ""}
                        multiline
                      />
                    ) : (
                      item.answer
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}

      <MediaLightbox
        open={lightbox.open}
        onOpenChange={lightbox.setOpen}
        images={galleryImages}
        index={lightbox.index}
        onIndexChange={(next) => {
          lightbox.setIndex(next)
          const nextSrc = galleryImages[next]?.src
          if (nextSrc) setActiveImage(nextSrc)
        }}
      />
    </div>
  )
}
