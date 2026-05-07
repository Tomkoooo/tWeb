import type { ComponentType } from "react"
import type { HomepageBlockType } from "@/features/homepage-cms/types/block-types"
import type { BlockDefinition } from "@/features/homepage-cms/blocks/types"
import { heroDefinition } from "@/features/homepage-cms/blocks/hero/definition"
import { aboutDefinition } from "@/features/homepage-cms/blocks/about/definition"
import { featuresDefinition } from "@/features/homepage-cms/blocks/features/definition"
import { productGridDefinition } from "@/features/homepage-cms/blocks/productGrid/definition"
import { contactDefinition } from "@/features/homepage-cms/blocks/contact/definition"
import { testimonialsDefinition } from "@/features/homepage-cms/blocks/testimonials/definition"
import { ctaDefinition } from "@/features/homepage-cms/blocks/cta/definition"
import { galleryDefinition } from "@/features/homepage-cms/blocks/gallery/definition"
import { richTextDefinition } from "@/features/homepage-cms/blocks/richText/definition"
import { dividerDefinition } from "@/features/homepage-cms/blocks/divider/definition"
import { HeroBlockView } from "@/features/homepage-cms/blocks/hero/View"
import { AboutBlockView } from "@/features/homepage-cms/blocks/about/View"
import { FeaturesBlockView } from "@/features/homepage-cms/blocks/features/View"
import { ProductGridBlockView } from "@/features/homepage-cms/blocks/productGrid/View"
import { ContactBlockView } from "@/features/homepage-cms/blocks/contact/View"
import { TestimonialsBlockView } from "@/features/homepage-cms/blocks/testimonials/View"
import { CtaBlockView } from "@/features/homepage-cms/blocks/cta/View"
import { GalleryBlockView } from "@/features/homepage-cms/blocks/gallery/View"
import { RichTextBlockView } from "@/features/homepage-cms/blocks/richText/View"
import { DividerBlockView } from "@/features/homepage-cms/blocks/divider/View"
import { HeroBlockEditor } from "@/features/homepage-cms/blocks/hero/Editor"
import { AboutBlockEditor } from "@/features/homepage-cms/blocks/about/Editor"
import { FeaturesBlockEditor } from "@/features/homepage-cms/blocks/features/Editor"
import { ProductGridBlockEditor } from "@/features/homepage-cms/blocks/productGrid/Editor"
import { ContactBlockEditor } from "@/features/homepage-cms/blocks/contact/Editor"
import { TestimonialsBlockEditor } from "@/features/homepage-cms/blocks/testimonials/Editor"
import { CtaBlockEditor } from "@/features/homepage-cms/blocks/cta/Editor"
import { GalleryBlockEditor } from "@/features/homepage-cms/blocks/gallery/Editor"
import { RichTextBlockEditor } from "@/features/homepage-cms/blocks/richText/Editor"
import { DividerBlockEditor } from "@/features/homepage-cms/blocks/divider/Editor"

export const BLOCK_DEFINITIONS: { [K in HomepageBlockType]: BlockDefinition<K> } = {
  hero: heroDefinition,
  about: aboutDefinition,
  features: featuresDefinition,
  productGrid: productGridDefinition,
  contact: contactDefinition,
  testimonials: testimonialsDefinition,
  cta: ctaDefinition,
  gallery: galleryDefinition,
  richText: richTextDefinition,
  divider: dividerDefinition,
}

export const BLOCK_VIEWS: Record<
  HomepageBlockType,
  ComponentType<any>
> = {
  hero: HeroBlockView,
  about: AboutBlockView,
  features: FeaturesBlockView,
  productGrid: ProductGridBlockView,
  contact: ContactBlockView,
  testimonials: TestimonialsBlockView,
  cta: CtaBlockView,
  gallery: GalleryBlockView,
  richText: RichTextBlockView,
  divider: DividerBlockView,
}

export const BLOCK_EDITORS: Record<
  HomepageBlockType,
  ComponentType<any>
> = {
  hero: HeroBlockEditor,
  about: AboutBlockEditor,
  features: FeaturesBlockEditor,
  productGrid: ProductGridBlockEditor,
  contact: ContactBlockEditor,
  testimonials: TestimonialsBlockEditor,
  cta: CtaBlockEditor,
  gallery: GalleryBlockEditor,
  richText: RichTextBlockEditor,
  divider: DividerBlockEditor,
}

export function getDefinition(type: HomepageBlockType) {
  return BLOCK_DEFINITIONS[type]
}

export function getAllDefinitions() {
  return Object.values(BLOCK_DEFINITIONS)
}

export function getView(type: HomepageBlockType) {
  return BLOCK_VIEWS[type]
}

export function getEditor(type: HomepageBlockType) {
  return BLOCK_EDITORS[type]
}
