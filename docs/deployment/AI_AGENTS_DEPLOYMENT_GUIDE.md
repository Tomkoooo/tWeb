# AI Agent Deployment Guide

One-page brief for agents (Cursor, Claude, etc.) wiring **templates**, **plugins**, and **environment** for a customer project or fork.

## Mental model

| Layer | What it controls | Source of truth |
| --- | --- | --- |
| **Build registry** | Which template/plugin *modules exist in this repo* | `src/templates/registry.ts`, `src/plugins/registry.ts` |
| **Deployment matrix** | Which templates/plugins a *running deploy* may use | [`deployments.config.json`](../../deployments.config.json) + [`src/config/deployments-registry.ts`](../../src/config/deployments-registry.ts) |
| **Runtime env** | Which matrix row is active | `DEPLOYMENT_KEY` (or `hostMap` in JSON) |
| **Mongo (per deploy)** | Active template, CMS content, flags | `ActiveTemplate`, `FeatureFlag`, etc. |

**One deployment = one shop** (one `DATABASE_URL`, one `DEPLOYMENT_KEY`). Do not assume multi-tenant host routing unless `hostMap` is populated.

## Hard rules for agents

1. **Never enable a template or plugin only in env** — update `deployments.config.json` and register the module in the correct registry file.
2. **`allowedTemplates`** must list every template id admins may activate; **`defaultTemplateId`** must be one of them.
3. **`enabledPlugins`** must only reference ids from `src/plugins/registry.ts`.
4. Set **`DEPLOYMENT_KEY`** on the hosting platform to the deployment `key` (e.g. `course-seller`).
5. Run **`npm run deployments:validate`** (or `npm run test:unit -- deployments`) after editing the matrix.
6. Plugins with **`featureFlagKey`** also need that flag enabled in admin (e.g. `pluginTicketing`).

## Workflow: new customer deployment

1. **Choose or create a template** — follow [AI_AGENTS_TEMPLATE_GUIDE.md](../templates/AI_AGENTS_TEMPLATE_GUIDE.md); register in `src/templates/registry.ts`.
2. **Add a deployment row** in `deployments.config.json`:

```json
{
  "key": "acme-shop",
  "label": "ACME courses",
  "allowedTemplates": ["default-modern"],
  "defaultTemplateId": "default-modern",
  "enabledPlugins": ["ticketing"],
  "pluginConfig": {
    "ticketing": { "checkoutMode": "direct" }
  }
}
```

3. **Register plugins** — [AI_AGENTS_PLUGIN_GUIDE.md](../plugins/AI_AGENTS_PLUGIN_GUIDE.md).
4. **Configure the host** — `DEPLOYMENT_KEY=acme-shop`, `DATABASE_URL`, auth secrets (see [FORK_DEPLOYMENT_ENGINE.md](./FORK_DEPLOYMENT_ENGINE.md)).
5. **Bootstrap** — deploy, seed CMS if needed, login admin, activate a template from **allowed** list (`/admin/templates`).
6. **Optional host mapping** — for multiple domains on one deploy, add `"hostMap": { "courses.example.com": "acme-shop" }`.

## Programmatic access (for scripts and agents)

```ts
import {
  getDeploymentAccessMatrix,
  getDeploymentDefinition,
  isTemplateAllowedForDeployment,
  isPluginAllowlistedForDeployment,
} from "@/config/deployments-registry"

// Full matrix for this build
getDeploymentAccessMatrix()

// Current deploy (uses DEPLOYMENT_KEY)
const d = getDeploymentDefinition()
d.allowedTemplates
d.enabledPlugins
```

## Related docs

- Templates: [AI_AGENTS_TEMPLATE_GUIDE.md](../templates/AI_AGENTS_TEMPLATE_GUIDE.md), [CREATING_A_TEMPLATE.md](../templates/CREATING_A_TEMPLATE.md)
- Plugins: [AI_AGENTS_PLUGIN_GUIDE.md](../plugins/AI_AGENTS_PLUGIN_GUIDE.md), [PLUGINS.md](../plugins/PLUGINS.md)
- Fork/deploy: [FORK_DEPLOYMENT_ENGINE.md](./FORK_DEPLOYMENT_ENGINE.md), [VERCEL_CUSTOM_DOMAIN_DEPLOYMENT.md](./VERCEL_CUSTOM_DOMAIN_DEPLOYMENT.md)
- CMS import: [AGENT_CONTENT_IMPORT.md](../cms/AGENT_CONTENT_IMPORT.md)
