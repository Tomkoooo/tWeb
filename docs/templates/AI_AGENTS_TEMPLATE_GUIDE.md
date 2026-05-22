# AI Agent Template Guide

A one-page brief for Cursor, Claude, or any code-generating agent that is asked to create a new Layout Template for this engine.

## What you are building

A `TemplateModule` (typed in [src/templates/types.ts](../../src/templates/types.ts)) that controls **`home` / `shop` / `pdp` / static** page shells and shared **chrome** (navbar/footer—including on **`/cart`**, **`/checkout`**, **`/profile`** via `StorefrontFlowShell`). The engine is **Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui**. Templates are TypeScript modules under `src/templates/<id>/`, statically imported. There is no runtime template loading.

Read [CREATING_A_TEMPLATE.md](./CREATING_A_TEMPLATE.md) before generating code. This guide is the short brief for the LLM; that doc is the human-readable specification.

For **homepage block CMS** internals (data model, `CmsEditProvider`, inline primitives, rendering caveats), read [HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md](../cms/HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md).

To **import customer-provided copy** into CMS/template content, read [AGENT_CONTENT_IMPORT.md](../cms/AGENT_CONTENT_IMPORT.md) (`npm run cms:inspect`, `npm run cms:apply-import`).

## Full-site branding (mandatory for new registry templates)

A new template is **not** “chrome + one static page.” Operators expect a coherent **layout language** everywhere the engine delegates to the template. Work through this list in order; skipping restyled pages while only editing Navbar, Footer, and `/about` is a failed template.

1. **`chrome/`** — `Navbar.tsx`, `Footer.tsx` (same world as the pages; respect `shopEnabled`, profile/admin affordances, neutral header — see *Registry realities* below).
2. **`pages/home/`** — On **path 1** (`homepage-blocks`): keep **`homepageSnapshotSchema`**, **`cmsPageKind`**, and a real **`HomeRender`** — **do not replace the persisted JSON shape** — but **do** change wrappers, spacing, typography, section rhythm, and token-driven styling so the public home no longer looks like an unmodified copy of the base template’s layout shell. **`/admin/cms/home`** previews **`TEMPLATE_REGISTRY[id].chrome` + `pages.home.Render`** (same as production), not a hardcoded engine layout.
3. **`pages/shop/`** and **`pages/pdp/`** — Implement a distinct **`Render`** (and matching CMS preview) for catalog and product shells; **`/shop`** is the storefront “search/catalog” surface (query + filters), not a separate engine route.
4. **`static-pages/<slug>/`** — Every slug in `manifest.capabilities.staticPages` gets a real layout, not a token edit of one page only.
5. **`flowPages`** — For **`manifest.deployment: "commerce"`**, either use **`flowPageCompose: 'routeOnly'`** + **`RouteMain`** for full-bleed custom UI ([`atelier-showcase`](../../src/templates/atelier-showcase/template.config.ts)), or ship **`Wrapper`** (+ optional **`shell`**, **`Body`**) like [`default-modern`](../../src/templates/default-modern/template.config.ts). Flow shell copy uses **`page:cart`** / **`page:checkout`** / **`page:profile`** when **`shell`** is set; only the homepage is editable under **`/admin/cms`** for most templates.
6. **`theme.ts` / `defaultTheme`** — Curate baseline tokens so resets and previews match the design (optional only when you consciously inherit engine defaults and say so in README).
7. **`commerceSlots.ProductCard`** (optional) — Custom grid card skin on `/shop` for parity between CMS product grids and the catalog.

**Engine boundary:** Routes and APIs stay under **`src/app/cart`**, **`src/app/checkout`**, **`src/app/profile`**. Templates control **presentation** via **`flowPages`** (framed **`Wrapper`/`shell`/`Body`** or **`flowPageCompose: 'routeOnly'`** + **`RouteMain`**) and the [**`@/templates/sdk`**](../../src/templates/sdk/index.ts) hooks (**`useTemplateCartActions`**, **`useCheckoutWizardModel`**, **`useProfileAccountModel`**). Replacing server handlers or Stripe contracts means forking the engine.

## Mandatory: homepage block CMS (registry templates)

When you add a **`TemplateModule`** to `src/templates/registry.ts`, **`pages.home`** **must** use the same **admin** contract as **`default-modern`**:

- `pages.home.schema` **must** be [`homepageSnapshotSchema`](../../src/features/homepage-cms/types/homepage-schema.ts) (re-export pattern: [`default-modern/pages/home/schema.ts`](../../src/templates/default-modern/pages/home/schema.ts)).
- `pages.home` **must** set **`cmsPageKind: "homepage-blocks"`**.
- `HomeRender` **must** render that snapshot — typically [`RealHomepageSections`](../../src/features/homepage-cms/render/RealHomepageSections.tsx) or [`HomepageRenderer`](../../src/features/homepage-cms/render/HomepageRenderer.tsx) — and work inside **`VisualHomepageEditor`** (template chrome + [`CmsEditProvider`](../../src/features/homepage-cms/components/editor/cms-edit-context.tsx)).
- Keep a minimal **`EditorPanel`** for typing; operators use **`/admin/cms/home`** only.

**Never** replace `home` with a bespoke JSON schema unless you fork the entire homepage CMS feature.

### On-canvas copy (`HomepageRenderer` / section components)

When `HomeRender` uses [`HomepageRenderer`](../../src/features/homepage-cms/render/HomepageRenderer.tsx) or shared sections with inline editing, wire [`useCmsEdit`](../../src/features/homepage-cms/components/editor/cms-edit-context.tsx) and [`EditableTextInline`](../../src/features/homepage-cms/components/primitives/EditableTextInline.tsx) / [`EditableLinkInline`](../../src/features/homepage-cms/components/primitives/EditableLinkInline.tsx) (see [`HeroBlockView`](../../src/features/homepage-cms/blocks/hero/View.tsx)). `updateField` only supports **top-level keys on `block.data`**; nested structures use [`patchBlockData`](../../src/features/homepage-cms/components/editor/cms-edit-context.tsx). The provider targets the **first enabled block of that `type`**.

### Shop, PDP, static pages, flow shells

There is **no** operator-facing CMS for these routes in this repo: [`listEditablePages`](../../src/templates/cms-pages.ts) returns **only** the homepage. Templates still ship **`schema`**, **`defaultContent`**, **`Render`**, and **`EditorPanel`** for shop/PDP/static (and optional **`flowPages.*.shell`**) for **storefront rendering**, defaults, and future tooling — not for **`/admin/cms`**.

## Registry realities (read before copying `minimal-shop` / `vivid-storefront`)

- **ENABLE_SHOP**: When the deploy sets `ENABLE_SHOP=false`, `/shop`, `/products`, `/cart`, `/checkout`, `/profile`, shop commerce APIs, and shop admin routes are unavailable. Pages receive **`shopEnabled`** on chrome from [`getActiveChrome()`](../../src/lib/active-chrome.ts). Template Navbars/Footers should respect `shopEnabled` (hide shop/cart/category links).
- **`manifest.deployment`**: Required (**`landing`** vs **`commerce`**). **`commerce`** stacks may list **`home`/`shop`/`pdp`** in **`restyles`**. **`landing`** forbids **`shop`/`pdp`** there (validated); still document marketing intent (`/admin/templates` badges).
- **`manifest.surfaces`**: Required. Almost always **`DEFAULT_TEMPLATE_SURFACES`** from [`src/templates/types.ts`](../../src/templates/types.ts). Only the **home** surface has an admin CMS entry ([`listEditablePages`](../../src/templates/cms-pages.ts)).
- **`commerceSlots.ProductCard`**: Optional catalogue / homepage product card. Storefront **`/shop`** passes **`resolveCommerceShopRendering(template)`** into **`deps.shopRendering`** (includes **`ProductCard`** and optional **`CategoryPill`**); admin shop preview uses the same helper in [`getShopCmsPreviewDeps`](../../src/features/template-cms/resolve-cms-preview-deps.ts). When the slot is absent, **`ShopRender`** falls back to the engine [`ProductCard`](../../src/components/shop/ProductCard.tsx).
- **`commerceSlots.CategoryPill`**: Optional; when set, included on **`deps.shopRendering.CategoryPill`** for **`/shop`** — use inside your **`pages.shop.Render`** (see **`atelier-showcase`** `AtelierShopFilters`).
- **`commerceSlots.ProductDetail`**: Optional **full PDP body** (gallery, variants, add-to-cart). When absent, templates still use the engine [`ProductDetail`](../../src/components/shop/ProductDetail.tsx) via [`ResolvedTemplateProductDetail`](../../src/components/shop/ResolvedTemplateProductDetail.tsx); **`PdpRender`** supplies editorial bands and **`introPlacement`**.
- **`flowPages.*.RouteMain`**: Replaces the **entire default** cart/checkout/profile **page body** for that route ([`FlowRoutePageClient`](../../src/components/flow-routes/FlowRoutePageClient.tsx)). Compose **`Default*PageView`** from [`@/templates/sdk`](../../src/templates/sdk/index.ts) only when you intentionally reuse engine UI.
- **`flowPageCompose: 'routeOnly'`** (on a **`flowPages`** entry): [`FlowPageTemplateBridge`](../../src/components/layout/FlowPageTemplateBridge.tsx) skips **`Wrapper`**, **`shell`**, and **`Body`** — **`RouteMain`** is full-bleed between Navbar and Footer (like **`pages.home.Render`**). Requires **`RouteMain`**; **forbids** **`Wrapper` / `shell` / `Body`**. See **`atelier-showcase`** `flowPages`.
- **Flow SDK** ([`@/templates/sdk`](../../src/templates/sdk/index.ts)): **`useTemplateCartActions`**, **`useCheckoutWizardModel`** (steps + **`/api/checkout/methods`** + submit / Stripe redirect), **`useProfileAccountModel`** (profile **`GET`/`PUT`/`DELETE`** + newsletter). Build any layout; reuse **`BillingStep`** / **`ShippingStep`** / etc. from **`@/components/checkout/*`** as optional building blocks.
- **`flowPages.profile.RouteChrome`**: Optional **profile chrome only** (aside + main wrapper). **`RouteChrome`** on cart/checkout is invalid ( **`defineTemplate`** rejects it).
- **PDP shell**: **`ProductDetail`** (or the slot) is shared commerce UI; **`PdpRender`** can set **`introPlacement`** (`belowHero` vs `aboveGrid`). PDP footer aligns with **`resolveStorefrontFooterContact`** like **`/shop`**.
- **`default-modern` home**: Uses the visual block editor; admins edit at **`/admin/cms/home`** with persistence via **`/api/admin/template-content`** (`pageKey: page:home`), not legacy draft keys.
- **Navbar**: Ship a profile/account affordance consistent with [`src/components/layout/Navbar.tsx`](../../src/components/layout/Navbar.tsx) so **`/profile`** and **`/admin`** (for authorized users) are reachable when the shop/profile surface is enabled. Thin navbars that only link Shop/About omit this.
- **Flow routes**: **`/cart`**, **`/checkout`**, **`/profile`** use [`StorefrontFlowShell`](../../src/components/layout/StorefrontFlowShell.tsx) + [`FlowPageTemplateBridge`](../../src/components/layout/FlowPageTemplateBridge.tsx). Default compose: **`Wrapper` → `shell` → `Body` →** [`FlowRoutePageClient`](../../src/components/flow-routes/FlowRoutePageClient.tsx). With **`flowPageCompose: 'routeOnly'`**, the bridge renders **only** the client slot (no extra template wrappers). **`profile.RouteChrome`** still wraps nested profile routes in [`profile/layout.tsx`](../../src/app/profile/layout.tsx). **`manifest.capabilities.restyles`** lists CMS pages (`home`, `shop`, `pdp`) only.
- **Shop filters / search**: Either reuse engine [`ShopFilters`](../../src/components/shop/ShopFilters.tsx) with URL query params, or ship a fully custom panel in **`pages.shop.Render`** (**`atelier-showcase`** demonstrates the latter + **`CategoryPill`**). **`vivid-storefront`'s filter button is non-functional** today; **`minimal-shop`** skips filters altogether.
- **Navbar color**: Prefer neutral header chrome (**`background`** / **`surface`** / **`border`**). **`bg-primary` across the whole bar** clashes with vivid brand palettes.
- **Mail/contact homepage**: **`default-modern`** uses the homepage **block CMS** (includes **contact / mail-shaped blocks** via `homepageSnapshotSchema`). **`minimal-shop`** and **`vivid-storefront`** use bespoke home schemas **without** those blocks—not equivalent interchangeably.
- **Newsletter**: Gate footer/home newsletter UI on the engine **`newsletter`** feature flag. **`vivid-storefront`** still shows signup in the footer independently of that flag—a doc’d gap.

## Workflow

1. Run the scaffolder to generate a starting tree:

   ```bash
   npm run create-template -- --id=<your-id> --base=default-modern [--deployment=commerce|landing]
   ```

2. Modify the generated files under `src/templates/<your-id>/` and add `public/template-previews/<your-id>.svg` for manifest screenshots.
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
- `@/features/homepage-cms/*` when implementing **`homepage-blocks`** home (e.g. `homepageSnapshotSchema`, `RealHomepageSections`) — same pattern as `default-modern`
- `@/templates/types`
- `@/components/ui/*` (shadcn primitives — Button, Input, Label, Sheet, Card, etc.)
- `@/components/common/*`, `@/components/sections/*`, `@/components/layout/*` (engine UI primitives)
- `@/lib/utils`, `@/lib/images`
- `react`, `react-dom`, `next/*`, `framer-motion`, `lucide-react`, `zod`, `clsx`, `tailwind-merge`

## Theme tokens you can use

`defaultTheme` on the `TemplateModule` is **optional**: export a full `ThemeTokens` object from `theme.ts` when the design has a curated palette; omit `defaultTheme` entirely to fall back to engine defaults ([`ThemeService.defaults`](../../src/services/theme.ts)). The storefront uses **baseline + admin overrides** from [`ThemeService.getMergedForTemplate`](../../src/services/theme.ts). **Reset to default & save** on `/admin/theme` clears overrides and reapplies the baseline (template or engine).

**Legacy theme rows:** If Mongo `ThemeSetting` was saved before **`overridesOnly: true`** (a full snapshot), it can mask a new template’s `defaultTheme`. **Activating a different template** clears legacy snapshots automatically; **`ThemeEditor` / `saveFullThemeForTemplate`** always writes **`overridesOnly: true`**. Merchants can still use **Reset** on `/admin/theme` after experiments.

Use Tailwind utilities backed by these tokens (defined in `src/app/globals.css`):

- Color: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-secondary-foreground`, `bg-accent`, `text-accent-foreground`, `bg-surface`, `text-surface-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-success`, `bg-warning`, `bg-error`
- Custom dark variant in default-modern: `bg-background-dark`

If you ship `defaultTheme`, cover all token keys (validated by `defineTemplate`). Admins override per-token at `/admin/theme`; reset restores the template baseline when set.

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
    surfaces: DEFAULT_TEMPLATE_SURFACES, // import from @/templates/types
  },
  defaultTheme: myThemeTokens, // optional — omit to use engine baseline only
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

This is the part LLMs typically get wrong. Imitate the rigor of [src/templates/minimal-shop/pages/home/Render.tsx](../../src/templates/minimal-shop/pages/home/Render.tsx):

- Pick a **type system** (e.g. all serif headlines, all sans body) and keep it consistent across pages.
- Pick a **spacing system** (e.g. always `py-24` for section padding) and keep it consistent.
- Choose specific aspect ratios for hero/product images and reuse them.
- Use `framer-motion` sparingly: subtle hovers and entrance animations, not "jiggle on scroll".
- Make the chrome (Navbar, Footer) instantly recognizable as belonging to the same world as the pages.

## Anti-patterns to avoid

- ❌ **Chrome-only (or chrome + one static page) “templates.”** Shipping a new registry template where only **`Navbar`/`Footer`** (and at most **one** static page like `/about`) differ from the scaffold while **`pages/home`**, **`pages/shop`**, and **`pages/pdp`** `Render` components still look like the **uncustomized base** — that is not acceptable; see *Full-site branding* above.
- ❌ Generic "card grid" layouts that look like every Bootstrap site from 2019. If your template doesn't have a strong point of view, it doesn't belong in the registry.
- ❌ Pulling product/category/review data from anywhere except `deps`.
- ❌ Removing or breaking **`cmsPageKind: "homepage-blocks"`** / **`homepageSnapshotSchema`** on **`pages.home`** for registry templates (that is the only admin CMS surface).
- ❌ Treating **`EditorPanel`** on shop/PDP/static as an operator workflow — **`/admin/cms`** does not route there; those panels exist for typing and potential future tools only.
- ❌ Hard-coding colors. Use theme tokens.
- ❌ Multiple `<h1>` elements per page. One per route.
- ❌ Omitting **`/profile`** / **`/admin`** entry from chrome when users expect accounts (mirror shared `Navbar`).
- ❌ Full-width **`bg-primary`** navbar—crushes readability for saturated brand primaries.
- ❌ Decorative **fake filter** buttons on `/shop` that never call **`ShopFilters`** or update URL params.
- ❌ Showing newsletter capture when **`newsletter`** is disabled (`FeatureFlagService` / `/api/feature-flags/newsletter`).

## Definition of done

- [ ] **Home CMS:** **`cmsPageKind: "homepage-blocks"`**, **`homepageSnapshotSchema`**, and a real **`HomeRender`** (`RealHomepageSections` / `HomepageRenderer` — not an empty scaffold).
- [ ] `npm run test:unit -- templates-contract` passes (validates manifest, schemas, defaults, slugs, homepage-blocks policy).
- [ ] `npx eslint src/templates/<your-id>` passes (no restricted imports, no `any`).
- [ ] `npx tsc --noEmit` passes.
- [ ] You manually previewed the template at `/admin/templates/<your-id>` after adding it to the registry.
- [ ] You manually opened **`/admin/cms/home`** and confirmed the **block editor** (device preview + inline fields + publish path).
- [ ] A screenshot exists at `public/template-previews/<your-id>.svg`.
- [ ] The README for the template documents its design intent in 3-5 lines.
- [ ] Chrome exposes account/admin navigation like the canonical [`Navbar`](../../src/components/layout/Navbar.tsx) (unless your fork README documents an intentional deviation).
