import { aboutSchema, type AboutContent } from "./schema"

export const aboutDefaultContent: AboutContent = aboutSchema.parse({
  hero: {
    eyebrow: "Our story",
    title: "Built by makers, for makers",
    body: "We started with a workshop, three friends, and the conviction that good things should outlast their packaging. Eight years in, we still pack every order ourselves.",
    image: "/generic-hero.svg",
  },
  pillars: [
    { number: "01", title: "Source it well", body: "Every supplier on a first-name basis. No anonymous warehouses." },
    { number: "02", title: "Tell the truth", body: "Specs, weights, finishes — exactly as they are. Photos that match what arrives." },
    { number: "03", title: "Stay small on purpose", body: "Smaller catalog, more time per product. Returns rates near zero." },
  ],
  storySections: [
    {
      heading: "It started with a corkscrew",
      body: "A friend asked us to source a brass corkscrew that wouldn't bend. Six months later we were importing them ourselves. Twelve months later we had three more products. Today we have sixty-something — each one earned its slot.",
      image: "",
    },
    {
      heading: "We pack every order ourselves",
      body: "No 3PL. No drop-shipping. We rent a small warehouse twenty minutes from the workshop, and three of us pack what ships every day.",
      image: "",
    },
  ],
  team: [
    { name: "Alex", role: "Sourcing", bio: "Spends two months a year traveling to workshops.", photo: "" },
    { name: "Mira", role: "Operations", bio: "Built the entire fulfillment process from scratch.", photo: "" },
    { name: "Jonas", role: "Design", bio: "Photographs every product personally.", photo: "" },
  ],
  cta: {
    eyebrow: "Get in touch",
    title: "Have a question? Want a piece in a different finish?",
    label: "Email us",
    href: "mailto:hello@example.com",
  },
  meta: {
    seoTitle: "About — Vivid Storefront",
    seoDescription: "Independent storefront featuring small-batch goods.",
  },
})
