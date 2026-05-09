import { shopSchema, type ShopContent } from "./schema"

export const shopDefaultContent: ShopContent = shopSchema.parse({
  heading: "Browse the catalog",
  eyebrow: "Shop",
  subheading:
    "Everything in stock today. Filter by category or sort by what's freshly arrived.",
  productGridColumns: 3,
  pageSize: 12,
  emptyStateMessage: "Nothing matches those filters yet — try clearing them.",
  meta: {
    seoTitle: "Shop — Vivid Storefront",
    seoDescription: "Browse the full catalog of independent goods.",
  },
})
