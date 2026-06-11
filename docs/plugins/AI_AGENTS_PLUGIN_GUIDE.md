# AI Agent Plugin Guide

Brief for agents adding or enabling a **plugin** (full-stack module: admin UI, API, models).

## Before you start

Read [AI_AGENTS_DEPLOYMENT_GUIDE.md](../deployment/AI_AGENTS_DEPLOYMENT_GUIDE.md) — plugins are **always** gated by `deployments.config.json` + `DEPLOYMENT_KEY`, not by code paths alone.

## Workflow: add a plugin

1. **Scaffold** under `src/plugins/<plugin-id>/`:
   - `plugin.config.ts` — `definePlugin({ manifest, admin?, api?, storefront? })`
   - `admin/*` — `Screen` component(s)
   - `api/handlers.ts` — `handle(context: PluginApiContext)`
   - `models/*` — Mongoose models if needed
2. **Register** in [`src/plugins/registry.ts`](../../src/plugins/registry.ts).
3. **Allowlist** on deployments in [`deployments.config.json`](../../deployments.config.json) → `enabledPlugins`.
4. **Optional runtime flag** — set `manifest.featureFlagKey` and seed it in [`src/actions/admin-flags.ts`](../../src/actions/admin-flags.ts).
5. **Validate** — `npm run deployments:validate` and `npm run test:unit -- plugins`.

## URLs (do not add new Next routes per feature)

| Surface | Pattern |
| --- | --- |
| Admin index | `/admin/plugins` |
| Admin screen | `/admin/plugins/{pluginId}/[[...path]]` |
| API | `/api/plugins/{pluginId}/[[...path]]` |

Dispatchers: [`src/app/admin/plugins/[pluginId]/[[...path]]/page.tsx`](../../src/app/admin/plugins/[pluginId]/[[...path]]/page.tsx), [`src/lib/plugins/dispatch-plugin-api.ts`](../../src/lib/plugins/dispatch-plugin-api.ts).

## Enablement stack

A plugin is **live** only when all of the following pass:

1. Id in **`enabledPlugins`** for the active deployment (`DEPLOYMENT_KEY`).
2. Module registered in **`src/plugins/registry.ts`**.
3. If `manifest.requiresShop` → `ENABLE_SHOP` is not `"false"`.
4. If `manifest.featureFlagKey` → DB flag enabled.

Middleware blocks `/admin/plugins/...` when not allowlisted. API returns `404 PLUGIN_DISABLED` when `PluginService.isEnabled()` is false.

## Admin home when shop is disabled

Optional on `PluginAdminConfig`:

- `primaryWhenShopDisabled: true` — `/admin` redirects to this plugin (prefer `statsSegment` if set).
- `statsSegment: "stats"` — `/admin/stats` redirects here; put KPIs on that route.

Add a **Statisztikák** nav item pointing at `statsSegment`. The generic `/admin` dashboard is shop-only.

## Email templates

Plugins can register transactional mail via **`getEmailTemplates()`** on the `PluginModule` (see [`camp-booking`](../../src/plugins/camp-booking/plugin.config.ts)).

- Each seed includes **`tags`** (e.g. `camp-booking`, `transactional`) and **`pluginId`** for the admin list at `/admin/emails`.
- Use **plugin-specific `type` strings** (e.g. `camp_registration_confirmation`) — do not reuse webshop `order_confirmation`.
- Send mail with `MailerService.sendEmail({ templateType, ... })` after seeding templates (`initializeMissingEmailTemplates` in admin).

Core shop templates are tagged `shop`; contact templates are tagged `contact`.

## Storefront UI

Plugin customer pages must look like the active deployment template — reuse engine chrome and shared components.

1. **Chrome** — `getStorefrontChromeBundle()` → template `Navbar` + `Footer` (see [`src/app/jegyvasarlas/page.tsx`](../../src/app/jegyvasarlas/page.tsx), [`src/app/sajto/[[...path]]/page.tsx`](../../src/app/sajto/[[...path]]/page.tsx)).
2. **Layout** — `STOREFRONT_MAIN_TOP_PADDING` + `container mx-auto` shell; avoid bespoke header bars that skip the logo/nav.
3. **Surface classes** — `getPluginStorefrontSurface(templateId)` from [`src/lib/plugin-storefront-ui.ts`](../../src/lib/plugin-storefront-ui.ts) for template-aware headings, prose, and cards.
4. **Primitives** — prefer `@/components/ui/*` (`Button`, `Card`, `Input`, `Label`, `LoadingSpinner`) and `@/components/common/FallbackImage` before new styled divs.
5. **Tokens** — `bg-background`, `text-muted-foreground`, `border-border`; no ad-hoc `neutral-*` / `rose-*` unless matching an existing template pattern.

Cursor rule: [`.cursor/rules/plugin-storefront-ui.mdc`](../../.cursor/rules/plugin-storefront-ui.mdc).

## Storefront / checkout (later)

Use `storefront.flowPages` on the plugin module to contribute `cart` / `checkout` / `profile` overrides (same contract as template `flowPages`). Wire through template bridge when implementing course direct-checkout.

## Reference plugin

[`src/plugins/camp-booking/`](../../src/plugins/camp-booking/) — tábor foglalás admin, API, storefront wizard.

## Contract

[`src/plugins/types.ts`](../../src/plugins/types.ts) — `definePlugin`, `PluginModule`, `PluginApiContext`.
