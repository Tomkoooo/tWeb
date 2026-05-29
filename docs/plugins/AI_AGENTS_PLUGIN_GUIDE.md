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

## Storefront / checkout (later)

Use `storefront.flowPages` on the plugin module to contribute `cart` / `checkout` / `profile` overrides (same contract as template `flowPages`). Wire through template bridge when implementing course direct-checkout.

## Reference plugin

[`src/plugins/ticketing/`](../../src/plugins/ticketing/) — skeleton admin + `GET /api/plugins/ticketing/status`.

## Contract

[`src/plugins/types.ts`](../../src/plugins/types.ts) — `definePlugin`, `PluginModule`, `PluginApiContext`.
