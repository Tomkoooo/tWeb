// Re-export façade over the existing homepage-cms block library.
// The block sources still live in src/features/homepage-cms/blocks/ to keep
// the dozens of admin imports stable. Templates should import from this
// barrel so a future physical move requires no template changes.

export {
  BLOCK_DEFINITIONS,
  BLOCK_VIEWS,
  BLOCK_EDITORS,
  getDefinition,
  getAllDefinitions,
  getView,
  getEditor,
} from "@/features/homepage-cms/registry/block-registry"

export type { BlockDefinition } from "@/features/homepage-cms/blocks/types"

export {
  homepageBlockSchema,
  homepageBlockTypeSchema,
  homepageSnapshotSchema,
} from "@/features/homepage-cms/types/homepage-schema"

export type {
  HomepageBlock,
  HomepageBlockType,
  HomepageSnapshot,
  HomepageMeta,
  HeroBlock,
  AboutBlock,
  FeaturesBlock,
  ProductGridBlock,
  ContactBlock,
  TestimonialsBlock,
  CtaBlock,
  GalleryBlock,
  RichTextBlock,
  DividerBlock,
} from "@/features/homepage-cms/types/block-types"
