# Vivid Storefront

A bold, warm e-commerce template built for shops with personality.

## Visual identity

- **Background:** warm cream (`#FFF6EE`)
- **Primary:** coral (`#E0532D`) — used for CTAs, navbar, and the newsletter band
- **Secondary:** deep navy (`#1B1F3A`) — used for the footer and "Why-pick-us" section
- **Accent:** electric purple (`#5B5FFF`) — used for eyebrow text, badges, and accents
- **Typography:** chunky sans-serif for headings, serif body where appropriate, monospace for eyebrow labels

## What it ships

- **Animated chrome** — solid coral navbar with sticky behavior, framer-motion driven scroll marquee, multi-column footer with a newsletter form
- **Home page** with eight composable sections:
  1. Hero with badges, dual CTA, and an animated "Live restocked" overlay card
  2. Editorial collections row (3 cards, accent-colored)
  3. Featured products grid (auto-pulled from latest stock)
  4. Spotlight (admin can either point at a product slug or hand-curate)
  5. Pillars / "Why-pick-us" on a dark navy band
  6. Testimonials in alternating cards
  7. Slow newsletter band
- **Shop** page — coral hero band, filter button, rounded product cards, paginated
- **PDP** — breadcrumb header, the engine's full ProductDetail (cart, variants, etc.), and a configurable trust strip below
- **About** static page (`/about`) — hero, pillars, alternating story sections, team grid, and a CTA band

## Editing in `/admin/cms`

The home, shop, PDP, and about pages all expose editor panels. The home editor is the most extensive — every text field, every collection card, every testimonial, every pillar is editable from the admin without touching code.

## Customizing

To change colors, edit `theme.ts`. To change layout/structure, edit the corresponding `Render.tsx`. To change the schema (what's editable), edit `pages/<page>/schema.ts` and `defaultContent.ts` together.
