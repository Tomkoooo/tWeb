# Creating a Template

A **Layout Template** controls the visual structure of every public page in the shop:

- **Chrome** — Navbar and Footer
- **Restyled pages** — `/` (home), `/shop`, `/products/[slug]`
- **Static pages** — extra public routes like `/about` that the template introduces and that the admin can fill in
- **Theme tokens** — default color palette
- **Editor panels** — admin UI for editing the page content

Templates live under [src/templates/](../src/templates) as TypeScript modules. Adding or modifying a template requires a redeploy. This is by design and is the security boundary: non-developers cannot run new code on the live site.

If you've never built a template before, copy [src/templates/default-modern](../src/templates/default-modern) and modify it. The contract is in [src/templates/types.ts](../src/templates/types.ts).

---

## Quick start: scaffolding a template

```bash
npm run create-template -- --id=my-template --base=default-modern
```

The scaffolder copies the base template, renames manifest fields, and registers the new template in `src/templates/registry.ts`. After it finishes:

1. Open `src/templates/my-template/template.config.ts` and update `manifest.name`, `manifest.description`, screenshots.
2. Modify `chrome/Navbar.tsx`, `chrome/Footer.tsx`, and the page renderers under `pages/`.
3. Run `npm run dev` and visit `/admin/templates` to preview the new template.
4. Click **Activate** to flip the live site over.

---

## File structure

```text
src/templates/<template-id>/
├── template.config.ts          # exports the TemplateModule
├── theme.ts                    # default ThemeTokens for this template
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
import { defineTemplate } from "@/templates/types"

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
  },
  defaultTheme: { /* ThemeTokens */ },
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

### Routes the template does not restyle

`manifest.capabilities.restyles` only covers **`home`**, **`shop`**, and **`pdp`**. Other storefront routes—**`/cart`**, **`/checkout`**, search-only views if they differ from `/shop`, etc.—keep the **default app layouts**, not the active `TemplateModule`. PDP is in contract, but a template may still ship a bare-bones PDP until you flesh it out.

When documenting a fork for merchants, say clearly that checkout and cart are **not** template-skin endpoints yet.

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

Your `defaultTheme` provides the starting color palette. Admins can override individual tokens at `/admin/theme`. The root layout merges your defaults with the admin's overrides and writes both as CSS variables on `<html>`. Use them via Tailwind utilities:

- `bg-background`, `text-foreground`, `bg-primary`, `text-accent`, `bg-surface`, `border-border`, `text-muted-foreground`, `bg-success`, `bg-warning`, `bg-error`.

See `src/app/globals.css` for the full mapping from tokens to Tailwind colors.

---

## Editor panels

Each page ships an `EditorPanel` — a client component rendered at `/admin/cms/[pageKey]`. It receives:

- `content` — the current saved content (already validated by the schema)
- `templateId`, `pageKey`
- `onSave(next)` — call this with a new content object; the engine re-validates and persists it

A simple panel is just a form that calls `onSave`. For a richer experience compose primitives from [src/templates/_shared/editor/](../src/templates/_shared/editor/index.ts).

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
