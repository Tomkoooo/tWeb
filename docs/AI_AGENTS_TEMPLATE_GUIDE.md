# AI Agent Template Guide

A one-page brief for Cursor, Claude, or any code-generating agent that is asked to create a new Layout Template for this engine.

## What you are building

A `TemplateModule` (typed in [src/templates/types.ts](../src/templates/types.ts)) that controls the visual structure of every public page of the shop. The engine is **Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui**. Templates are TypeScript modules under `src/templates/<id>/`, statically imported. There is no runtime template loading.

Read [docs/CREATING_A_TEMPLATE.md](./CREATING_A_TEMPLATE.md) before generating code. This guide is the short brief for the LLM; that doc is the human-readable specification.

## Registry realities (read before copying `minimal-shop` / `vivid-storefront`)

- **Navbar**: Ship a profile/account affordance consistent with [`src/components/layout/Navbar.tsx`](../src/components/layout/Navbar.tsx) so **`/profile`** and **`/admin`** (for authorized users) are reachable. Thin navbars that only link Shop/About omit this.
- **Not restyled by templates**: **`/cart`** and **`/checkout`** stay on default layouts; only `home` / `shop` / `pdp` (+ static pages) are template-owned. PDP may still need design polish per template.
- **Shop filters**: Wire [`ShopFilters`](../src/components/shop/ShopFilters.tsx) and URL query params—or omit filters entirely. **`vivid-storefront`'s filter button is non-functional** today; **`minimal-shop`** skips filters altogether.
- **Navbar color**: Prefer neutral header chrome (**`background`** / **`surface`** / **`border`**). **`bg-primary` across the whole bar** clashes with vivid brand palettes.
- **Mail/contact homepage**: **`default-modern`** uses the homepage **block CMS** (includes **contact / mail-shaped blocks** via `homepageSnapshotSchema`). **`minimal-shop`** and **`vivid-storefront`** use bespoke home schemas **without** those blocks—not equivalent interchangeably.
- **Newsletter**: Gate footer/home newsletter UI on the engine **`newsletter`** feature flag. **`vivid-storefront`** still shows signup in the footer independently of that flag—a doc’d gap.

## Workflow

1. Run the scaffolder to generate a starting tree:

   ```bash
   npm run create-template -- --id=<your-id> --base=default-modern
   ```

2. Modify the generated files. Do **not** add files outside `src/templates/<your-id>/` and `public/template-previews/<your-id>.svg` unless you have a strong architectural reason.
3. Verify with `npm run test:unit -- templates-contract` and `npx eslint src/templates`. Both must pass before declaring the template done.

## Hard rules (lint-enforced; failures fail CI)

Inside `src/templates/**`:

- ❌ **Do not import** `@/services/*`, `@/models/*`, `@/lib/db`, `@/lib/mongodb`, `@/lib/admin-auth`, `@/actions/*`, `@/app/api/*` at runtime. Type-only imports from `@/services/*` and `@/models/*` are allowed.
- ❌ **Do not access** `process.env`.
- ❌ **Do not register** API routes, server actions, or middleware.
- ❌ **Do not** mutate cart, session, or auth state.
- ✅ **Do** receive all data via props. Renders take exactly `{ content, deps }`. Editor panels take exactly `{ content, templateId, pageKey, onSave }`.

## Allowed imports

- `@/templates/_shared/*` (block library, editor primitives)
- `@/templates/types`
- `@/components/ui/*` (shadcn primitives — Button, Input, Label, Sheet, Card, etc.)
- `@/components/common/*`, `@/components/sections/*`, `@/components/layout/*` (engine UI primitives)
- `@/lib/utils`, `@/lib/images`
- `react`, `react-dom`, `next/*`, `framer-motion`, `lucide-react`, `zod`, `clsx`, `tailwind-merge`

## Theme tokens you can use

Use Tailwind utilities backed by these tokens (defined in `src/app/globals.css`):

- Color: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-secondary-foreground`, `bg-accent`, `text-accent-foreground`, `bg-surface`, `text-surface-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-success`, `bg-warning`, `bg-error`
- Custom dark variant in default-modern: `bg-background-dark`

Provide a `defaultTheme: ThemeTokens` covering all 19 tokens. Admins can override per-token at `/admin/theme`.

## Required structure

Every template must export `TemplateModule` with:

```ts
{
  manifest: {
    id: "kebab-case-unique",
    name: "Human Readable",
    version: "1.0.0",
    author: "...",
    description: "...",
    screenshots: ["/template-previews/<id>.svg"],
    capabilities: {
      hasBlog: false,        // always false; see fork doc
      staticPages: [...],    // slugs you ship under staticPages
      restyles: ["home", "shop", "pdp"],
    },
  },
  defaultTheme: { /* all 19 ThemeTokens */ },
  chrome: { Navbar, Footer },
  pages: {
    home: { schema, defaultContent, Render, EditorPanel },
    shop: { schema, defaultContent, Render, EditorPanel },
    pdp:  { schema, defaultContent, Render, EditorPanel },
  },
  staticPages: { /* slug -> PageDefinition */ },
}
```

Wrap with `defineTemplate()` so the manifest is validated at module load.

## Render component contracts

```ts
// pages/home/Render.tsx
import type { RenderProps, HomePageDeps } from "@/templates/types"
import type { HomeContent } from "./schema"

export function HomeRender({ content, deps }: RenderProps<HomeContent, HomePageDeps>) {
  // deps.products, deps.categories, deps.reviews, deps.company are pre-fetched
  return <main>...</main>
}
```

Same shape for `shop` (`ShopPageDeps`), `pdp` (`PdpPageDeps`), and static pages (`StaticPageDeps`). Renders are server components by default. Make them client components only when they need interactivity that can't live in a child component.

## Editor panel contract

```ts
// pages/home/EditorPanel.tsx
"use client"
import type { EditorProps } from "@/templates/types"

export function HomeEditorPanel({ content, onSave }: EditorProps<HomeContent>) {
  // Build a form, then call await onSave(nextContent)
}
```

`onSave` re-validates against your `schema` and persists. Throw to roll back. Use `sonner`'s `toast` for feedback.

## Schema design

- Always `z.object({ ... })`, not `z.union` or top-level `z.array`.
- Provide `.default(...)` on every field so missing values don't break the editor.
- Include a `meta: { seoTitle, seoDescription }` object on every page that has a publicly-meaningful URL (home, shop, pdp, static pages).
- Static-page slug rules: lowercase, hyphens or `/` only, must not collide with engine paths (`shop`, `products`, `cart`, `checkout`, `admin`, `api`, `auth`, `profile`, `maintenance`, `_next`, `favicon.ico`, `robots.txt`, `sitemap.xml`, `uploads`).

## Visual quality bar

This is the part LLMs typically get wrong. Imitate the rigor of [src/templates/minimal-shop/pages/home/Render.tsx](../src/templates/minimal-shop/pages/home/Render.tsx):

- Pick a **type system** (e.g. all serif headlines, all sans body) and keep it consistent across pages.
- Pick a **spacing system** (e.g. always `py-24` for section padding) and keep it consistent.
- Choose specific aspect ratios for hero/product images and reuse them.
- Use `framer-motion` sparingly: subtle hovers and entrance animations, not "jiggle on scroll".
- Make the chrome (Navbar, Footer) instantly recognizable as belonging to the same world as the pages.

## Anti-patterns to avoid

- ❌ Generic "card grid" layouts that look like every Bootstrap site from 2019. If your template doesn't have a strong point of view, it doesn't belong in the registry.
- ❌ Pulling product/category/review data from anywhere except `deps`.
- ❌ Inventing new schema fields that the editor doesn't expose.
- ❌ Hard-coding colors. Use theme tokens.
- ❌ Multiple `<h1>` elements per page. One per route.
- ❌ Omitting **`/profile`** / **`/admin`** entry from chrome when users expect accounts (mirror shared `Navbar`).
- ❌ Full-width **`bg-primary`** navbar—crushes readability for saturated brand primaries.
- ❌ Decorative **fake filter** buttons on `/shop` that never call **`ShopFilters`** or update URL params.
- ❌ Showing newsletter capture when **`newsletter`** is disabled (`FeatureFlagService` / `/api/feature-flags/newsletter`).

## Definition of done

- [ ] `npm run test:unit -- templates-contract` passes (validates manifest, schemas, defaults, slugs).
- [ ] `npx eslint src/templates/<your-id>` passes (no restricted imports, no `any`).
- [ ] `npx tsc --noEmit` passes.
- [ ] You manually previewed the template at `/admin/templates/<your-id>` after adding it to the registry.
- [ ] A screenshot exists at `public/template-previews/<your-id>.svg`.
- [ ] The README for the template documents its design intent in 3-5 lines.
- [ ] Chrome exposes account/admin navigation like the canonical [`Navbar`](../src/components/layout/Navbar.tsx) (unless your fork README documents an intentional deviation).
