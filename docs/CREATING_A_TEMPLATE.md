# Creating a Template

A **Layout Template** controls the visual structure of every public page in the shop:

- **Chrome** — Navbar and Footer
- **Restyled pages** — `/` (home), `/shop`, `/products/[slug]`
- **Static pages** — extra public routes like `/about` that the template introduces and that the admin can fill in
- **Theme tokens** — optional packaged palette (`defaultTheme`) per template; admins can override any token
- **Editor panels** — admin UI for editing the page content

Templates live under [src/templates/](../src/templates) as TypeScript modules. Adding or modifying a template requires a redeploy. This is by design and is the security boundary: non-developers cannot run new code on the live site.

If you've never built a template before, copy [src/templates/default-modern](../src/templates/default-modern) and modify it. The contract is in [src/templates/types.ts](../src/templates/types.ts).

**Landing-only deployments:** Operators can set `ENABLE_SHOP=false` to hide the storefront and shop admin UI. Templates should honor optional **`ChromeProps.shopEnabled`** in Navbar/Footer (see [`src/lib/active-chrome.ts`](../src/lib/active-chrome.ts)).

---

## Quick start: scaffolding a template

```bash
npm run create-template -- --id=my-template --base=default-modern

# Landing-scoped scaffold (marketing-first; adjusts restyles via scaffolder)
npm run create-template -- --id=my-landing --base=default-modern --deployment=landing
```

The scaffolder copies the base template, renames manifest fields, and registers the new template in `src/templates/registry.ts`. After it finishes:

1. Open `src/templates/my-template/template.config.ts` and update `manifest.name`, `manifest.description`, screenshots, and `manifest.deployment` if needed.
2. **Customize every delegated surface** (not only chrome):  
   (a) `chrome/Navbar.tsx`, `chrome/Footer.tsx`  
   (b) `pages/home/Render.tsx` (and home wiring — preserve **`homepage-blocks`** + `homepageSnapshotSchema` if you copied `default-modern`)  
   (c) `pages/shop/Render.tsx` — this is the storefront catalog / query / filters surface  
   (d) `pages/pdp/Render.tsx`  
   (e) each `static-pages/<slug>/Render.tsx` you declare  
   (f) `pages/flow/FlowWrappers.tsx` and `flowPages` in `template.config.ts` — **commerce** templates should wrap **`cart`**, **`checkout`**, and **`profile`** for the same rhythm as the rest of the site (see *Flow routes* below)  
   (g) `theme.ts` / `defaultTheme` when the design has a curated palette  
   (h) optional `commerceSlots.ProductCard` for `/shop` grid skin  
3. **Home admin CMS** (mandatory for templates added to this repo): keep **`cmsPageKind: "homepage-blocks"`** + **`homepageSnapshotSchema`** on `pages.home` when you scaffold from `default-modern`. There is **no** `/admin/cms` editor for shop, PDP, static slugs, or flow shells — see [AI_AGENTS_TEMPLATE_GUIDE.md](./AI_AGENTS_TEMPLATE_GUIDE.md) § *Mandatory: homepage block CMS*.
4. Run `npm run test:unit -- templates-contract`.
5. Run `npm run dev` and visit `/admin/templates` to preview the new template; open **`/admin/cms/home`** for the block editor.
6. Click **Activate** to flip the live site over.

**Common agent mistake:** Polishing **only** the homepage CMS while **leaving shop, PDP, static `Render.tsx` files, and flow wrappers visually identical** to the scaffold. Delegated surfaces must each look intentional — not only Navbar, Footer, and `/`.

---

## File structure

```text
src/templates/<template-id>/
├── template.config.ts          # exports the TemplateModule
├── theme.ts                    # optional ThemeTokens for this template (`defaultTheme`; omit file + field for engine-only baseline)
├── README.md                   # short summary of the design intent
├── chrome/
│   ├── Navbar.tsx              # appears at the top of every public page
│   └── Footer.tsx              # appears at the bottom of every public page
├── pages/
│   ├── home/
│   │   ├── schema.ts           # Zod schema describing editable content
│   │   ├── defaultContent.ts   # initial content used on first install
│   │   ├── Render.tsx          # server component that renders the page
│   │   └── EditorPanel.tsx     # admin-side editor (client component)
│   ├── shop/
│   │   └── ...                 # same shape as home/
│   └── pdp/
│       └── ...                 # product detail page
└── static-pages/               # optional extra public routes
    └── about/
        └── ...                 # same shape as home/
```

## The contract

A template is a value of type `TemplateModule` from [src/templates/types.ts](../src/templates/types.ts):

```ts
import { DEFAULT_TEMPLATE_SURFACES, defineTemplate } from "@/templates/types"
import { myPaletteFromThemeTs } from "./theme" // or omit both import and defaultTheme below

export const myTemplate = defineTemplate({
  manifest: {
    id: "my-template",
    name: "My Template",
    version: "1.0.0",
    author: "You",
    description: "A short, honest description of the design intent.",
    screenshots: ["/template-previews/my-template.png"],
    capabilities: {
      hasBlog: false,                 // v1: always false (see "Dynamic data" below)
      staticPages: ["about"],         // slugs of pages this template ships
      restyles: ["home", "shop", "pdp"],
    },
    surfaces: DEFAULT_TEMPLATE_SURFACES, // CMS + ENABLE_SHOP gating (landing vs shop surfaces)
    deployment: "commerce",             // required: "commerce" | "landing" — see Deployment below
  },
  // defaultTheme imported from ./theme.ts — omit the property to inherit engine defaults
  defaultTheme: myPaletteFromThemeTs,
  chrome: { Navbar, Footer },
  pages: {
    home: { schema, defaultContent, Render, EditorPanel },
    shop: { schema, defaultContent, Render, EditorPanel },
    pdp:  { schema, defaultContent, Render, EditorPanel },
  },
  staticPages: {
    about: { schema, defaultContent, Render, EditorPanel },
  },
})
```

`defineTemplate()` validates the manifest, asserts that every declared static-page slug is safe and not reserved by the engine, and throws at module-import time on misconfiguration so bad templates fail at build, not at request time.

### `deployment` (landing vs commerce)

[`TemplateManifest.deployment`](../src/templates/types.ts) is **merchant intent**, not enforcement: `ENABLE_SHOP` still disables APIs and CMS shop entries regardless.

- **`commerce`**: Full storefront positioning; `capabilities.restyles` may include **`home`**, **`shop`**, **`pdp`**.
- **`landing`**: Brochure / marketing-first. **`defineTemplate`** forbids listing **`shop`** or **`pdp`** in **`restyles`** — keep shop/PDP `PageDefinition` modules in code for typings, but do not advertise them as restyled surfaces.

Admin **Sablonok** lists a badge (**Teljes bolt** vs **Landing / marketing**).

### Product detail page editorial placement

The product route **[`products/[slug]/page.tsx`](../src/app/products/[slug]/page.tsx)** delegates to **`template.pages.pdp.Render`**, which typically feeds **[`ProductDetail`](../src/app/products/[slug]/ProductDetail.tsx)**. **`PdpRender`** may pass **`introPlacement`** to `ProductDetail`:

- **`aboveGrid`** (default): eyebrow/title/body + highlight cards render **above** the gallery / buy-box grid (legacy).
- **`belowHero`**: same content renders **below** the two-column hero grid so shoppers see gallery + commerce UI first — avoids text-only first paint before the hero image fades in.

### `commerceSlots` (presentation slots)

[`TemplateModule.commerceSlots`](../src/templates/types.ts) may set optional presentational components resolved by [`resolveCommerceSlots`](../src/templates/resolve-commerce-slots.tsx) (or the shorthands `resolveCommerceProductCard` / **`resolveCommerceShopRendering`** from [`@/templates/sdk`](../src/templates/sdk/index.ts)).

- **`ProductCard`** — fully custom or engine-style card. The storefront passes it as **`deps.shopRendering.ProductCard`** on **[`/shop`](../src/app/shop/page.tsx)** via **`resolveCommerceShopRendering(template)`** (also used in the **admin shop CMS preview**). The homepage carousel resolves the same slot client-side using **`HomePageDeps.templateId`** inside [`Shop`](../src/components/sections/Shop.tsx).
- **`CategoryPill`** — optional chip/row for category and filter links. When set, **`/shop`** includes it on **`deps.shopRendering.CategoryPill`** (same helper). Your **`pages.shop.Render`** should render pills (see **`atelier-showcase`** `AtelierShopFilters` + `AtelierCategoryPill`).
- **`NavbarSearch`** — optional replacement for engine [`LiveSearch`](../src/components/layout/LiveSearch.tsx). Public routes pass **`NavbarSearch`** from [`getActiveChrome()`](../src/lib/active-chrome.ts) into the template chrome `Navbar`.
- **`PdpChrome`** — optional adornment wrapper for PDP when your `PdpRender` adopts it.

### Template engine boundaries

| Area | Template-driven today? | Notes |
|------|------------------------|--------|
| Shop catalogue grid card | Yes | `commerceSlots.ProductCard` via **`resolveCommerceShopRendering`** → **`deps.shopRendering.ProductCard`** |
| Shop category / filter UI | Yes | Implement in **`pages.shop.Render`** (any layout). Optional **`CategoryPill`** slot is passed on **`deps.shopRendering`** when declared. |
| Homepage featured product cards | Yes | Same **`ProductCard`** slot + homepage **`templateId`** |
| Navbar search field | Optional | `commerceSlots.NavbarSearch`; otherwise engine `LiveSearch` |
| PDP core layout (variants, add-to-cart) | Yes (swap body) | Optional **`commerceSlots.ProductDetail`** replaces the full PDP product body; else engine UI. |
| Cart / checkout / profile **main body** | Yes | **`flowPages.*.RouteMain`** replaces the default **`CartPageView` / `CheckoutPageView` / `ProfilePageView`** (see [`FlowRoutePageClient`](../src/components/flow-routes/FlowRoutePageClient.tsx)). Compose from **`Default*PageView`** only when you want default UX inside custom chrome. |
| Profile chrome (sidebar + main) | Yes (profile only) | **`flowPages.profile.RouteChrome`** |
| Category filters | Yes | No single engine component is required — **`atelier-showcase`** replaces **`ShopFilters`** entirely inside **`ShopRender`**. |

**Template SDK:** Prefer [`useTemplateCartActions`](../src/templates/sdk/use-template-cart-actions.ts) from `@/templates/sdk` when template or slot components need cart mutations, instead of importing the Zustand store module directly. Use **`resolveCommerceShopRendering`** when building custom admin previews that must mirror **`/shop`** deps.

### Fully custom cart / checkout / profile UX (checklist)

1. **`flowPages.<route>.RouteMain`** — client component; receives **`shopEnabled`** and **`variant`** (`FlowRouteMainProps`). When you return your own tree, the default page body is **not** mounted.
2. **Cart** — use **`useTemplateCartActions()`** (or the cart store via the SDK façade) so line items, totals, and **`Link href="/checkout"`** stay compatible with the engine checkout route.
3. **Checkout** — the default view owns the **Stripe + step validation** pipeline. For a different *look*, wrap **`DefaultCheckoutPageView`** or reuse pieces under **`src/components/checkout/`**. Replacing *logic* means re‑implementing those steps against the same APIs (high effort; not required for “different UI”).
4. **Profile** — same pattern: **`DefaultProfilePageView`** for default forms, or custom UI that still posts to the same **`/api/user/profile`** patterns the engine uses.
5. **`/shop`** — you own **`pages.shop.Render`**: grid, search, category tree, and which **`deps.shopRendering`** slots you read. Pass **`resolveCommerceShopRendering(template)`** from the shop route so **`ProductCard`** and **`CategoryPill`** match production.

### CMS UX: homepage block editor only

Operators edit **one** surface: **`/admin/cms/home`**, via **`cmsPageKind: "homepage-blocks"`** + **`homepageSnapshotSchema`** + [`VisualHomepageEditor`](../src/features/homepage-cms/components/editor/VisualHomepageEditor.tsx). See [AI Agents Guide](./AI_AGENTS_TEMPLATE_GUIDE.md) § *Mandatory: homepage block CMS* and [HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md](./HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md).

Declare **`pages.home.allowedBlocks`** (ordered list of homepage block keys like `hero`, `about`, `productGrid`, …) when the storefront [`RealHomepageSections`](../src/features/homepage-cms/render/RealHomepageSections.tsx)-driven layout only uses a subset: the CMS then shows hide/show chips and the block inserter **only for those types**, and published/draft payloads are pruned/stripped so stray blocks (`cta`, `gallery`, …) from older saves disappear. Omit **`allowedBlocks`** to derive allowed types from whatever appears in **`defaultContent.blocks`** (full block library UX).

---

Register your template in [src/templates/registry.ts](../src/templates/registry.ts):

```ts
import { myTemplate } from "./my-template/template.config"

export const TEMPLATE_REGISTRY = {
  "default-modern": defaultModern,
  "minimal-shop": minimalShop,
  "my-template": myTemplate,
}
```

---

## Restyled pages: home, shop, pdp

These three pages already exist in the engine. The template's job is to layout the data the engine fetches.

The route file (`src/app/page.tsx`, `src/app/shop/page.tsx`, `src/app/products/[slug]/page.tsx`) fetches data and passes it to your `Render` as `deps`. Your `Render` receives `{ content, deps }`:

- `content` is the admin-edited content for this page (validated by your `schema`).
- `deps` is the page's data (products, categories, reviews, the product, etc.) — see `HomePageDeps`, `ShopPageDeps`, `PdpPageDeps` in [src/templates/types.ts](../src/templates/types.ts).

You **must not** fetch data inside a Render (no DB, no service imports). The route owns data; the template owns layout.

---

## Known limitations & authoring conventions

These points describe how the bundled templates behave today and what new templates should aim for.

### Navbar: account menu and admin access

Chrome **must not** strand shoppers who need account settings or staff who need the dashboard. Prefer the same UX as the engine navbar in [`src/components/layout/Navbar.tsx`](../src/components/layout/Navbar.tsx): a visible account/profile control (dropdown or equivalent) that links to **`/profile`** (and related account flows) and exposes **`/admin`** when the viewer is allowed to access it.

Some registry templates ship a slimmer navbar without that menu—treat that as incomplete for production unless you add an equivalent pattern.

### Flow routes: framed vs full-bleed (`routeOnly`)

`manifest.capabilities.restyles` still only lists **`home`**, **`shop`**, and **`pdp`**. **`/cart`**, **`/checkout`**, and **`/profile`** use [`StorefrontFlowShell`](../src/components/layout/StorefrontFlowShell.tsx) for **`Navbar` / `Footer`**, then [`FlowPageTemplateBridge`](../src/components/layout/FlowPageTemplateBridge.tsx) for optional template composition.

**Default (`flowPageCompose` omitted):** **`Wrapper` → `shell` (optional) → `Body` (optional) → route `children`**. Same as before: **`Wrapper`** is required; **`Body`** must render **`children`** when used.

**Full-bleed (`flowPageCompose: 'routeOnly'`):** the bridge renders **only** the route’s `children` (no **`Wrapper`**, **`shell`**, or **`Body`**). Set **`RouteMain`** to the component that owns **100% of the viewport between navbar and footer** — same creative scope as **`pages.home.Render`**. You **must not** set **`Wrapper`**, **`shell`**, or **`Body`** with **`routeOnly`** (`defineTemplate` rejects it). **`profile`** may still use **`RouteChrome`** in **`profile/layout.tsx`** (aside + main around nested routes).

**`RouteMain`** is resolved by [`FlowRoutePageClient`](../src/components/flow-routes/FlowRoutePageClient.tsx) and receives **`shopEnabled`** + **`variant`**.

### Template SDK: flow business logic without default UI

From [`@/templates/sdk`](../src/templates/sdk/index.ts):

- **`useTemplateCartActions()`** — cart lines, totals, **`addItem` / `removeItem` / `updateQuantity` / `clearCart`** (Zustand façade).
- **`useCheckoutWizardModel()`** — checkout steps, **`/api/checkout/methods`**, validation between steps, **`buildOrderPayload`**, Stripe vs COD **`POST`** (same behaviour as engine checkout). Build **your own** layout; you may still render engine step pieces (**`BillingStep`**, **`ShippingStep`**, etc.) from **`@/components/checkout/*`** as building blocks, or replace them with custom fields that produce the same payload shape.
- **`useProfileAccountModel()`** — load/save **`/api/user/profile`**, newsletter flag, sign-out / delete account.

Optional reuse of the **entire** default page component: **`DefaultCartPageView`**, **`DefaultCheckoutPageView`**, **`DefaultProfilePageView`**.

**PDP:** optional **`commerceSlots.ProductDetail`** replaces the **full product detail body**; omit it to keep the engine [`ProductDetail`](../src/components/shop/ProductDetail.tsx).

For **`deployment: "commerce"`**, either use **`flowPageCompose: 'routeOnly'`** + custom **`RouteMain`** (see [`atelier-showcase/template.config.ts`](../src/templates/atelier-showcase/template.config.ts)) or the framed **`Wrapper`** pattern like [`default-modern/template.config.ts`](../src/templates/default-modern/template.config.ts).

The storefront **catalog and search-query UX** is **`/shop`**, restyled by **`pages.shop.Render`** — not a separate template “search page” unless you add new engine routes.

### Shop page: search query vs filters

`/shop` supports query-string filters (category, sale, sort, pagination) wired in the route. **`default-modern`** mounts the shared [`ShopFilters`](../src/components/shop/ShopFilters.tsx) component so filtering works.

**`minimal-shop`** omits filter UI altogether. **`vivid-storefront`** shows filter affordances that are **not** wired to `ShopFilters` or URL state—purely cosmetic. New templates should either integrate **`ShopFilters`** (and preserve `buildPageHref` / query params) or intentionally omit filters, not imitate a dead control.

### Navbar color: do not flood the chrome with `primary`

If the whole header uses `bg-primary`, a shop whose brand primary is red (or neon, etc.) gets an overwhelming, low-contrast top bar. Prefer **neutral chrome** (`background`, `surface`, `muted`, subtle border) and use **`primary` for accents**—logo mark, cart badge, hover states, CTAs—not full-width navbar fill.

### Contact / “mail” content on the homepage

**`default-modern`** maps `pages.home` to the legacy homepage block CMS (`homepageSnapshotSchema` in [`src/features/homepage-cms/`](../features/homepage-cms/)), which includes a **contact** block (mail-oriented copy + structured contact fields rendered by the shared block registry).

**`minimal-shop`** and **`vivid-storefront`** define their own home `schema.ts` / `EditorPanel.tsx` stacks and **do not** expose that contact block—they are not drop-in substitutes if you relied on configurable mail/contact sections like the default template.

### Newsletter UI vs the feature flag

The engine gates newsletter behavior with the **`newsletter`** feature flag (see `/api/feature-flags/newsletter` and admin layout usage). Homepage sections and footer signup UI should **respect that flag**: when newsletter is disabled for the deployment, hide signup fields and CMS labels that imply a working list—otherwise admins and visitors see flows that admin has turned off.

The bundled **`vivid-storefront`** footer (and related blocks) currently always show signup; **`minimal-shop`** is lighter but may still reference newsletter copy. Treat mismatch with the flag as a gap to fix in the template **or** call it out honestly in merchant-facing docs until aligned.

---

## Static pages

Static pages are extra public routes that the template introduces. They are served by the catch-all `src/app/[...slug]/page.tsx` and can hold any text/image/list content the admin can edit.

Add a slug to `manifest.capabilities.staticPages` AND to the `staticPages` map. The two must agree.

Constraints enforced at module load:

- Slug must be lowercase letters/digits/hyphens (with `/` for nested), no leading `/`, no `..`.
- Slug must not collide with engine-reserved paths (`shop`, `products`, `cart`, `checkout`, `admin`, `api`, `auth`, `profile`, `maintenance`, `_next`, `favicon.ico`, `robots.txt`, `sitemap.xml`, `uploads`).

Static pages can render any layout you want, but they receive only `{ branding }` as `deps`. They cannot list products, posts, or other dynamic data — that's the dynamic-data fork path below.

---

## Theme tokens

`TemplateModule.defaultTheme` is **optional**. When set, it defines the **baseline** palette for that template: the root layout applies `getEffectiveThemeBase(activeTemplate)` merged with admin overrides from MongoDB (see [ThemeService](../src/services/theme.ts)). When omitted, the baseline is the engine’s built-in defaults (`ThemeService.defaults()`).

Persistence model:

- New saves store **only tokens that differ from the baseline** (`overridesOnly` in `ThemeSetting`).
- **Reset to default & save** on `/admin/theme` clears overrides so the live site returns to the baseline (template tokens if present, otherwise engine defaults).

Admins can preview the baseline locally with **Preview baseline** before committing a reset. Tokens are written as CSS variables on `<html>`; use them via Tailwind utilities:


- `bg-background`, `text-foreground`, `bg-primary`, `text-accent`, `bg-surface`, `border-border`, `text-muted-foreground`, `bg-success`, `bg-warning`, `bg-error`.

See `src/app/globals.css` for the full mapping from tokens to Tailwind colors.

---

## Editor panels

Non-home pages still ship an **`EditorPanel`** in the **`PageDefinition`** contract (for typing, tests, and possible future tools) but **are not mounted** from **`/admin/cms`** — only the homepage block editor is.

The homepage uses [`VisualHomepageEditor`](../src/features/homepage-cms/components/editor/VisualHomepageEditor.tsx) instead of the per-page `EditorPanel`. For block-based home, compose primitives from [`features/homepage-cms`](../src/features/homepage-cms/) and shared sections as in `default-modern`.

### Homepage block CMS (policy for **new** registry templates)

[AI_AGENTS_TEMPLATE_GUIDE.md](./AI_AGENTS_TEMPLATE_GUIDE.md) § *Mandatory: homepage block CMS* is the source of truth. Summary:

| Surface | Admin editor |
|---------|----------------|
| **Home** | **`cmsPageKind: "homepage-blocks"`** + **`homepageSnapshotSchema`** + `HomeRender` using **`RealHomepageSections`** or **`HomepageRenderer`**. |
| **Shop / PDP / static / flow shell** | **None** in this repo — content comes from **`defaultContent`**, seeding, or code changes. |

`npm run test:unit -- templates-contract` enforces **`homepage-blocks`** on every registered template’s home.

---

## What templates can and cannot do

**Allowed imports**:

- `@/templates/_shared/*`
- `@/templates/types`
- `@/components/ui/*` (shadcn primitives)
- `@/components/common/*`, `@/components/sections/*` (marked-public components)
- `@/lib/utils`, `@/lib/images`
- `framer-motion`, `lucide-react`, `react`, `react-dom`, `next/*`, `zod`, `clsx`, `tailwind-merge`

**Forbidden** (lint-enforced; see [eslint.config.mjs](../eslint.config.mjs)):

- `@/services/*` — templates do not fetch data.
- `@/models/*` — templates do not touch MongoDB.
- `@/lib/admin-auth`, `@/lib/db`, `@/lib/mongodb` — templates do not authenticate.
- `process.env` — templates do not read environment.
- `@/actions/*` and `@/app/api/*` — templates do not call admin APIs.

**Other rules**:

- Templates cannot register API routes or server actions.
- Templates cannot mutate cart, session, or auth state.
- Static-page slugs must be safe (validated at module load).

---

## Dynamic-data fork path: blogs, knowledge bases, custom collections

v1 of the template engine only supports **static** template-introduced pages — about pages, contact pages, custom landings with admin-editable copy and images.

If your template needs a blog, knowledge base, or other dynamic content (where admins can create individual entries and visitors interact with them), you are doing more than templating: you are extending the engine. Here's the supported path:

### Step 1: Add the data model

Create a new Mongoose model under `src/models/`. Example for a blog:

```ts
// src/models/BlogPost.ts
import mongoose, { Schema, Document, Model } from "mongoose"

export interface IBlogPost extends Document {
  slug: string
  title: string
  body: string
  publishedAt: Date | null
  author?: string
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    publishedAt: { type: Date },
    author: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema)
```

### Step 2: Add a service

```ts
// src/services/blog.ts
import dbConnect from "@/lib/db"
import BlogPost from "@/models/BlogPost"

export class BlogService {
  static async listPublished() {
    await dbConnect()
    return BlogPost.find({ publishedAt: { $ne: null } })
      .sort({ publishedAt: -1 })
      .lean()
  }

  static async getBySlug(slug: string) {
    await dbConnect()
    return BlogPost.findOne({ slug }).lean()
  }
}
```

### Step 3: Add admin CRUD pages

Create `src/app/admin/blog/page.tsx` (list), `src/app/admin/blog/new/page.tsx`, and `src/app/admin/blog/[id]/page.tsx`. Add a sidebar entry in [src/components/admin/AdminSidebar.tsx](../src/components/admin/AdminSidebar.tsx). Use `requireAdmin()` for protection. Pattern: copy the existing `src/app/admin/products/` flow.

### Step 4: Add the public routes

Because the catch-all `[...slug]` only serves static template pages, blog routes need their own explicit App Router files:

- `src/app/blog/page.tsx` — list view, calls `BlogService.listPublished()`
- `src/app/blog/[slug]/page.tsx` — detail view, calls `BlogService.getBySlug()`

Both should use `getActiveChrome()` so they pick up the active template's Navbar and Footer.

### Step 5 (optional): Let templates customize the look

If you want templates to be able to provide their own blog list/detail components, add `pages.blog` and `pages.blogPost` to the `TemplateModule` contract and have your blog routes delegate to them — same pattern as `home`/`shop`/`pdp`.

### When it's worth it

For most fork operators, a Notion- or Substack-embedded "blog" link in the navbar is sufficient and avoids the extension cost. Only do the steps above when:

- You need full styling control of every post.
- You need to integrate posts with products (e.g. "as featured in our latest article").
- You want SEO-clean URLs hosted on your domain.

---

## Checklist before shipping a template

- [ ] **Homepage block CMS** satisfied (see [AI_AGENTS_TEMPLATE_GUIDE.md](./AI_AGENTS_TEMPLATE_GUIDE.md)): `cmsPageKind: "homepage-blocks"` + real `HomeRender`; `npm run test:unit -- templates-contract` passes.
- [ ] `manifest.id` is unique and lowercase-with-hyphens.
- [ ] `manifest.version` follows semver.
- [ ] Screenshots exist at the URL declared in `manifest.screenshots`.
- [ ] Every `Render` receives only `{ content, deps }` — no service or DB imports.
- [ ] Every page schema is `z.object({ ... })` and `defaultContent` parses cleanly via `schema.parse(defaultContent)`.
- [ ] Tailwind colors used are defined as theme tokens (not hard-coded hex unless intentional).
- [ ] Static pages use only the schemas your `EditorPanel` actually exposes.
- [ ] Navbar includes account/profile entry to **`/profile`** and staff path to **`/admin`** where applicable (mirror [`Navbar`](../src/components/layout/Navbar.tsx) unless you consciously improve on it).
- [ ] Navbar chrome is **not** a flat `bg-primary` slab; accents use primary, background stays readable.
- [ ] Shop filtering either uses **`ShopFilters`** with correct query handling or omits filters—no decorative non-working filter buttons.
- [ ] Newsletter signup UI is hidden when the **`newsletter`** feature flag is off (if your template exposes newsletter at all).
- [ ] Contract test passes: `npm run test:unit -- templates`.
- [ ] Manually previewed at `/admin/templates`.
