# Plugins

Optional full-stack modules (admin UI, API, models) gated per deployment.

**Agents:** start with [AI_AGENTS_PLUGIN_GUIDE.md](./AI_AGENTS_PLUGIN_GUIDE.md) and [AI_AGENTS_DEPLOYMENT_GUIDE.md](../deployment/AI_AGENTS_DEPLOYMENT_GUIDE.md).

## Registries

| What | Where |
| --- | --- |
| Plugins in this build | [`src/plugins/registry.ts`](../../src/plugins/registry.ts) |
| Per-deployment allowlist | [`deployments.config.json`](../../deployments.config.json) |
| Typed API + matrix | [`src/config/deployments-registry.ts`](../../src/config/deployments-registry.ts) |

## Enable a plugin

1. Register the plugin in [`src/plugins/registry.ts`](../../src/plugins/registry.ts).
2. Add the plugin id to `enabledPlugins` for a deployment in [`deployments.config.json`](../../deployments.config.json).
3. Set `DEPLOYMENT_KEY` in the deployment environment to that deployment’s `key` (e.g. `minecraft-camp`).
4. If the plugin manifest sets `featureFlagKey`, enable that flag in **Admin → Beállítások → Plugin beállítások** (e.g. `pluginCampBooking`).
5. Run `npm run deployments:validate`.

## URLs

- Admin index: `/admin/plugins`
- Plugin admin: `/admin/plugins/{pluginId}/…`
- Plugin API: `/api/plugins/{pluginId}/…`

## Ticketing (skeleton)

- Model: `TicketEvent`
- Minecraft camp sample deployment: `DEPLOYMENT_KEY=minecraft-camp`
