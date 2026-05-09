import { homeSchema, type HomeContent } from "./schema"

export const homeDefaultContent: HomeContent = homeSchema.parse({
  hero: {
    eyebrow: "Curated collection",
    headline: "Quiet design, made to last.",
    body: "A small catalog of considered pieces, sourced from independent makers and held to a single standard: built to outlive the trend.",
    ctaLabel: "Browse the shop",
    ctaHref: "/shop",
    image: "/generic-hero.svg",
  },
  pillars: [
    { title: "Made well", body: "Every product is tested by us before it ever ships to you." },
    { title: "Slow inventory", body: "We restock when the maker is ready, not when the calendar says so." },
    { title: "Honest pricing", body: "Transparent margins, no inflated 'before' prices." },
  ],
  featured: {
    headline: "This week's selection",
    description: "Six things we are quietly obsessed with right now.",
    showProductGrid: true,
    productLimit: 6,
  },
  closing: {
    headline: "Stay in touch",
    body: "We send a short note when we restock or have something genuinely new. No noise.",
  },
})
