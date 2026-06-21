# Admin user guide (Súgó)

End-user documentation rendered in the admin at **[/admin/sugo](/admin/sugo)**. Written in Hungarian for non-technical operators.

## File layout

```
docs/admin-user-guide/
  sections/
    00-bevezetes.md          # Shared — always
    01-oldalsav.md
    ...
    10-webshop-alapok.md     # scope: shop
    12-tabor-mod-navigacio.md
    templates/               # filtered by deployment.allowedTemplates
    plugins/                 # filtered by deployment.enabledPlugins + runtime enabled
```

## Adding a section

1. Create a markdown file under `docs/admin-user-guide/sections/`.
2. Register it in [`src/lib/admin-guide/manifest.ts`](../../src/lib/admin-guide/manifest.ts):

```ts
{
  id: "my-section",
  title: "Megjelenő cím a tartalomjegyzékben",
  file: "sections/my-section.md",
  visibility: {
    scope: "always",           // always | shop | shopDisabled
    deploymentKeys: ["cabinova"], // optional — omit for all deployments
    templateIds: ["cabinova"],    // optional — ANY match in allowedTemplates
    pluginIds: ["camp-booking"],  // optional — allowlisted + PluginService.isEnabled()
  },
},
```

3. Keep sections **ordered** in the manifest — that order is the table of contents.

## Visibility rules

| Field | Behavior |
| --- | --- |
| `scope: "always"` | Every deployment |
| `scope: "shop"` | Only when `ENABLE_SHOP=true` |
| `scope: "shopDisabled"` | Only when shop is off |
| `deploymentKeys` | Restrict to listed deployment keys |
| `templateIds` | Show if deployment allows any listed template |
| `pluginIds` | Show if plugin is allowlisted **and** feature flag enabled |

## Template CMS page tables

Template sections automatically append a **Szerkeszthető CMS oldalak** table built from `listEditablePages()` in the sugo page server component. Do not duplicate URL tables in markdown for templates — describe fields and workflows in prose instead.

## When to update

- New template `allowedBlocks`, static page slug, or CMS surface → update template markdown + manifest if new template id
- New plugin admin nav item → update plugin markdown
- New admin sidebar route → update `01-oldalsav.md`
- New deployment in `deployments.config.json` → verify shared sections still apply; add deployment-specific notes if needed

## Related code

| File | Role |
| --- | --- |
| `src/lib/admin-guide/manifest.ts` | Section registry |
| `src/lib/admin-guide/resolve-sections.ts` | Visibility filter |
| `src/app/admin/sugo/page.tsx` | Server page |
| `src/components/admin/guide/*` | UI renderer |
| `src/components/admin/AdminSidebar.tsx` | **Súgó** nav item |

## Writing style

- Hungarian, plain language, short steps
- Bold exact UI labels as they appear in admin
- Link admin routes as `/admin/...` (rendered as clickable Next.js links)
- Always mention draft vs **Közzététel**
