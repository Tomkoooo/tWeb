import { homeSchema, type HomeContent } from "./schema"

export const homeDefaultContent: HomeContent = homeSchema.parse({
  hero: {
    eyebrow: "Independent storefront",
    headline: "Goods made bright",
    headlineAccent: "and built to last",
    body: "Small-batch products from makers we visit personally. Fewer drops, longer-lived things, prices that match the work.",
    primaryCtaLabel: "Shop the catalog",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: "Our story",
    secondaryCtaHref: "/about",
    image: "/generic-hero.svg",
    badges: ["Independent", "Hand-tested", "Plastic-free packaging", "Free returns"],
  },
  collections: [
    {
      title: "Workshop tools",
      description: "Slow-made implements for the everyday workbench.",
      href: "/shop?category=tools",
      image: "/generic-hero.svg",
      accentColor: "coral",
    },
    {
      title: "Home essentials",
      description: "The kind of objects that age with character.",
      href: "/shop?category=home",
      image: "/generic-hero.svg",
      accentColor: "purple",
    },
    {
      title: "Kitchen & table",
      description: "Cookware and tableware that earns counter space.",
      href: "/shop?category=kitchen",
      image: "/generic-hero.svg",
      accentColor: "navy",
    },
  ],
  spotlight: {
    enabled: true,
    eyebrow: "This week's pick",
    title: "A piece worth waiting for",
    description: "Hand-cast brass with a satin finish. Sourced from a workshop we've worked with for five years. Limited to 60 units this run.",
    ctaLabel: "See the spotlight",
    ctaHref: "/shop",
    image: "/generic-hero.svg",
    productSlug: "",
  },
  features: {
    title: "Why people pick us",
    items: [
      { title: "We test it first", body: "If it doesn't work in our own homes for a month, it doesn't ship." },
      { title: "We tell you the truth", body: "Specs, dimensions, sourcing. No staged photography, no inflated 'before' prices." },
      { title: "We don't blast you", body: "One newsletter when there's something to say. Unsubscribe is a single click." },
    ],
  },
  testimonials: {
    title: "Kind words",
    items: [
      { quote: "Two years in and the brass corkscrew still looks better than the day I unwrapped it.", name: "Anna K.", role: "Verified customer" },
      { quote: "Fast shipping, beautiful packaging, very humane support.", name: "Daniel B.", role: "Verified customer" },
      { quote: "These are the only tools I've ever bought that came with a name on them.", name: "Léa M.", role: "Verified customer" },
    ],
  },
  newsletter: {
    enabled: true,
    title: "A short note when something arrives",
    body: "Sign up for our slow newsletter. One email, max, when we have a real restock or a new maker.",
    buttonLabel: "Sign me up",
    placeholder: "you@example.com",
  },
  meta: {
    seoTitle: "Vivid Storefront — independent goods, made to last",
    seoDescription:
      "An independent storefront featuring small-batch goods from makers we trust.",
  },
})
