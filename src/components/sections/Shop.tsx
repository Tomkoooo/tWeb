"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronRight, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import { EditableTextInline } from "@/features/homepage-cms/components/primitives/EditableTextInline"
import { EditableLinkInline } from "@/features/homepage-cms/components/primitives/EditableLinkInline"
import { FallbackImage } from "@/components/common/FallbackImage"
import { MediaLightbox, useMediaLightbox, type MediaLightboxItem } from "@/components/common/MediaLightbox"
import { MediaZoomButton } from "@/components/common/MediaZoomButton"
import { mediaImageSrc } from "@/lib/images"
import { getTemplateById } from "@/templates/registry"
import { resolveCommerceProductCard } from "@/templates/resolve-commerce-slots"
import { homepageFeaturedToProductDetail } from "@/features/homepage-cms/render/homepage-product-card-shape"
import type { HomePageFeaturedProduct } from "@/templates/types"

interface ShopProps {
  /** Active template — resolves `commerceSlots.ProductCard` client-side (homepage `deps` includes this). */
  templateId: string
  categories?: any[]
  products?: HomePageFeaturedProduct[]
  title?: string
  description?: string
  viewAllLabel?: string
  viewAllHref?: string
  categoriesTitle?: string
  categoriesDescription?: string
}

export function Shop({
  templateId,
  categories = [],
  products = [],
  title,
  description,
  viewAllLabel,
  viewAllHref,
  categoriesTitle,
  categoriesDescription,
}: ShopProps) {
  const cms = useCmsEdit()
  const categoryLightboxItems = React.useMemo<MediaLightboxItem[]>(
    () =>
      (categories || [])
        .filter((cat) => Boolean(cat?.image))
        .map((cat) => ({
          src: mediaImageSrc(cat.image),
          alt: cat.name || "Kategória",
        })),
    [categories]
  )
  const categoryLightbox = useMediaLightbox({ images: categoryLightboxItems })

  const ProductCardCmp = React.useMemo(
    () => resolveCommerceProductCard(getTemplateById(templateId)),
    [templateId]
  )

  return (
    <section id="shop" className="py-32 bg-background-dark px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {cms.enabled ? (
              <div className="space-y-2">
                <EditableTextInline
                  blockType="productGrid"
                  field="title"
                  value={title ?? "LOREM IPSUM PRODUCT COLLECTION"}
                  className="text-4xl md:text-7xl font-heading font-black text-foreground text-left uppercase"
                />
                <EditableTextInline
                  blockType="productGrid"
                  field="description"
                  value={
                    description ??
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  }
                  multiline
                  className="text-neutral-400 text-xl max-w-2xl leading-relaxed"
                />
              </div>
            ) : (
              <>
                <h2 className="text-4xl md:text-7xl font-heading font-black mb-6 text-foreground text-left uppercase">
                  {title ?? "LOREM IPSUM PRODUCT COLLECTION"}
                </h2>
                <p className="text-neutral-400 text-xl max-w-2xl leading-relaxed">
                  {description ??
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                </p>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {cms.enabled ? (
              <EditableLinkInline
                blockType="productGrid"
                labelField="viewAllLabel"
                hrefField="viewAllHref"
                label={viewAllLabel || "VIEW ALL PRODUCTS"}
                href={viewAllHref || "/shop"}
                className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background h-14 px-8 text-lg btn-krausz font-black"
                buttonVariant="outline"
              />
            ) : (
              <Link href={viewAllHref || "/shop"}>
                <Button className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background h-14 px-8 text-lg btn-krausz font-black">
                  {viewAllLabel || "VIEW ALL PRODUCTS"} <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {categories.map((category, idx) => {
            const openCategoryLightbox = () => {
              const lbIndex = categoryLightboxItems.findIndex(
                (item) =>
                  item.alt === (category.name || "Kategória") &&
                  item.src === mediaImageSrc(category.image)
              )
              if (lbIndex >= 0) categoryLightbox.openAt(lbIndex)
            }
            const categoryHref = cms.enabled ? "#" : `/shop?category=${category.id}`

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group h-[400px] overflow-hidden border border-white/5"
              >
                <Link
                  href={categoryHref}
                  onClick={(event) => {
                    if (cms.enabled) event.preventDefault()
                  }}
                  className="absolute inset-0 z-0 block"
                  aria-label={`${category.name} kategória megnyitása`}
                />
                <FallbackImage
                  src={category.image}
                  alt={category.name}
                  fill
                  unoptimized
                  className="pointer-events-none object-cover transition-transform duration-1000 opacity-60 group-hover:scale-110 group-hover:opacity-100"
                />
                {category.image ? (
                  <MediaZoomButton
                    className="max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    onClick={openCategoryLightbox}
                  />
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
                <div className="pointer-events-none absolute inset-0 z-10 p-10 flex flex-col justify-end items-start text-left">
                  <h3 className="text-3xl font-heading font-black text-foreground mb-3 tracking-tighter uppercase">
                    {category.name}
                  </h3>
                  <p className="text-neutral-300 text-sm mb-6 line-clamp-2 max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all max-md:translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 duration-500">
                    {category.description}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center bg-primary text-white btn-krausz px-6 h-10 text-sm font-black",
                      "max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all max-md:translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 duration-500"
                    )}
                  >
                    EXPLORE <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="space-y-16 py-10 border-t border-white/5">
          <div className="flex items-center gap-6">
            {cms.enabled ? (
              <EditableTextInline
                blockType="productGrid"
                field="categoriesTitle"
                value={categoriesTitle ?? "Featured Selection"}
                className="text-3xl font-heading font-black text-foreground uppercase tracking-tighter"
              />
            ) : (
              <h3 className="text-3xl font-heading font-black text-foreground uppercase tracking-tighter">
                {categoriesTitle ?? "Featured Selection"}
              </h3>
            )}
            <div className="h-[2px] grow bg-white/5" />
          </div>
          {cms.enabled ? (
            <EditableTextInline
              blockType="productGrid"
              field="categoriesDescription"
              value={categoriesDescription ?? ""}
              className="text-neutral-500 -mt-10"
            />
          ) : categoriesDescription ? (
            <p className="text-neutral-500 -mt-10">{categoriesDescription}</p>
          ) : null}

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className={cn(
                    "pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
                    cms.enabled && "[&_button]:pointer-events-none [&_a[href*='products']]:pointer-events-none"
                  )}
                >
                  <ProductCardCmp product={homepageFeaturedToProductDetail(product)} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden lg:flex justify-end gap-3 mt-10">
              <CarouselPrevious className="relative left-0 translate-y-0 h-14 w-14 bg-muted/40 border-border text-foreground hover:bg-primary hover:border-primary-foreground/40 rounded-none" />
              <CarouselNext className="relative right-0 translate-y-0 h-14 w-14 bg-muted/40 border-border text-foreground hover:bg-primary hover:border-primary-foreground/40 rounded-none" />
            </div>
          </Carousel>
        </div>
      </div>

      <MediaLightbox
        open={categoryLightbox.open}
        onOpenChange={categoryLightbox.setOpen}
        images={categoryLightboxItems}
        index={categoryLightbox.index}
        onIndexChange={categoryLightbox.setIndex}
      />
    </section>
  )
}
