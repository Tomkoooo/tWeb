# Legacy `ShopContent` field inventory

The storefront **homepage** is driven by **`PageContentService`** and the block snapshot (`HomepageSnapshot`); see [HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md](./HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md).

This note lists **flat `ShopContent` document keys** still defined in `ShopContentService` (`src/services/shop-content.ts`) for **legacy MongoDB rows** and any tooling that reads that collection. It is **not** the live homepage authoring contract.

## Source of truth (keys and persistence)

- `src/services/shop-content.ts` — `ShopContentKey` union and CRUD helpers
- `src/models/ShopContent.ts` — Mongoose model

## Text Fields by Section

### Hero

- `hero_title`
- `hero_description`
- `hero_primary_cta`
- `hero_secondary_cta`

### Story

- `story_title`
- `story_content`

### Features

- `features_title`
- `features_subtitle`

### Reviews

- `reviews_title`
- `reviews_subtitle`

### Shop

- `shop_title`
- `shop_description`
- `shop_view_all_label`
- `shop_featured_title`

### Contact

- `contact_title`
- `contact_highlight`
- `contact_description`
- `contact_form_button`
- `contact_email`
- `contact_phone`
- `contact_address`

### Homepage SEO

- `shop_seo_title`
- `shop_seo_description`

## Structured List Fields

### `hero_badges`

- Current storage: JSON string in `ShopContent.value`
- Expected logical shape:
  - array of badge items
  - each item may contain:
    - `title`
    - `subtitle`
    - or fallback keys (`text`, `sub`, `content`) used by `Hero` rendering

### `story_accordions`

- Current storage: JSON string
- Expected logical shape:
  - array of objects:
    - `title: string`
    - `content: string`

### `story_cards`

- Current storage: JSON string
- Expected logical shape:
  - array of objects:
    - `title: string`
    - `content: string` (or `desc` fallback)

### `features_cards`

- Current storage: JSON string
- Expected logical shape:
  - array of objects:
    - `title: string`
    - `description: string` (or `content` fallback)

## Notes for Next CMS Iteration

- Keep list fields typed as arrays in editor state and serialize to JSON only at persistence boundaries.
- Add explicit zod schemas for each list field before save to prevent malformed payloads.
- Migrate fallback key aliases (`desc`, `content`, `text`, `sub`) to a single canonical schema in a one-time normalization pass.
