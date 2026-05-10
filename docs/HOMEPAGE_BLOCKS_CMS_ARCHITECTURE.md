# Homepage “block CMS” architecture (default-modern reference)

This document explains **how the default-modern home page CMS works** in this repo: data shape, admin UI, inline editing, and how that differs from **shop / PDP / static / flow** editors. Use it when building or reviewing templates so agents do not confuse the two systems.

---

## Executive summary

**Admin CMS is homepage-only.** The route [`/admin/cms/home`](../src/app/admin/cms/[pageKey]/page.tsx) (via [`listEditablePages`](../src/templates/cms-pages.ts)) mounts [`VisualHomepageEditor`](../src/features/homepage-cms/components/editor/VisualHomepageEditor.tsx) through a thin [`CmsTemplatePageClient`](../src/features/template-cms/components/CmsTemplatePageClient.tsx) wrapper.

There is **no** separate “visual fields” or form-based editor for shop, PDP, static pages, or flow shells — those surfaces still have `schema` / `defaultContent` / `Render` on the template for **storefront** data and migrations, but operators do not get `/admin/cms/...` entries for them.

---

## Template wiring (default-modern)

In [`src/templates/default-modern/template.config.ts`](../src/templates/default-modern/template.config.ts):

- **`pages.home.cmsPageKind: "homepage-blocks"`** — turns on `VisualHomepageEditor` for `/admin/cms/home`.
- **`schema`** — [`homeSchema`](../src/templates/default-modern/pages/home/schema.ts) re-exports [`homepageSnapshotSchema`](../src/features/homepage-cms/types/homepage-schema.ts); content type is **`HomepageSnapshot`**.
- **`defaultContent`** — from [`getDefaultHomepageSnapshot()`](../src/features/homepage-cms/utils/default-snapshot.ts).
- **`Render`** — [`HomeRender`](../src/templates/default-modern/pages/home/Render.tsx) delegates to [`RealHomepageSections`](../src/features/homepage-cms/render/RealHomepageSections.tsx).
- **`EditorPanel`** — a **stub** that tells operators to use `/admin/cms/home`; the real UI is **not** the panel (see comment in [`HomeEditorPanel.tsx`](../src/templates/default-modern/pages/home/EditorPanel.tsx)).

To give another template the **same** homepage experience: keep **`cmsPageKind: "homepage-blocks"`**, reuse the same schema/defaultContent pattern, and supply a `home.Render` that works inside the editor’s provider (see below).

---

## Data model: `HomepageSnapshot`

Defined in [`block-types.ts`](../src/features/homepage-cms/types/block-types.ts):

- **`blocks`**: ordered list of discriminated blocks (`hero`, `about`, `features`, `productGrid`, `contact`, `testimonials`, `cta`, `gallery`, `richText`, `divider`). Each has `id`, `type`, `enabled`, `data`, and optional `visibility` per field.
- **`meta`**: `seoTitle`, `seoDescription` (edited in the VisualHomepageEditor settings dialog via [`SeoEditor`](../src/features/site-settings/components/SeoEditor.tsx)).

Zod validation lives in [`homepage-schema.ts`](../src/features/homepage-cms/types/homepage-schema.ts).

**Block-type reference implementations** (for CMS-only previews / definitions) live under [`src/features/homepage-cms/blocks/`](../src/features/homepage-cms/blocks/) (`Editor` + `View` per block). The **live storefront and the VisualHomepageEditor preview** for default-modern do **not** map the JSON array 1:1 into those `*BlockView` components; they use **shared section components** under [`src/components/sections/`](../src/components/sections/) (see “Rendering path”).

---

## Admin UI / UX (`VisualHomepageEditor`)

Implemented in [`VisualHomepageEditor.tsx`](../src/features/homepage-cms/components/editor/VisualHomepageEditor.tsx).

### Top bar

- Device preview (desktop / tablet / mobile) via [`DevicePreview`](../src/features/homepage-cms/components/editor/DevicePreview.tsx).
- Undo / redo (Zustand history in [`editor-store.ts`](../src/features/homepage-cms/store/editor-store.ts)).
- Save draft, publish, discard draft, full-page review, exit to CMS hub.
- Settings dialog: **Theme** + **SEO** (and related globals).

### Global quick edits (not stored in `HomepageSnapshot`)

- **Navbar / footer logos and brand name** — [`EditableLogo`](../src/features/site-settings/components/EditableLogo.tsx), [`EditableBrandName`](../src/features/site-settings/components/EditableBrandName.tsx); persisted via `/api/admin/branding`.
- **Footer links / settings** when the template Footer supports `cmsEditable` (default-modern passes `onSettingsChange` → `/api/admin/footer`).

### Block management strip

- **[`Inserter`](../src/features/homepage-cms/components/editor/Inserter.tsx)** — appends a new block using [`createDefaultBlock`](../src/features/homepage-cms/store/editor-store.ts) (from [`block-registry`](../src/features/homepage-cms/registry/block-registry.ts) definitions).
- **Per-block chips** — toggle `enabled`, delete block.
- **[`Breadcrumb`](../src/features/homepage-cms/components/editor/Breadcrumb.tsx)** — shows selected block type (lightweight context, not a full property inspector).

### Main canvas

- Wraps the active template’s **`Navbar` → `home.Render` → `Footer`** with theme CSS variables from [`themeTokensToCssVars`](../src/lib/theme-css-vars.ts).
- Wraps the main column in **[`CmsEditProvider`](../src/features/homepage-cms/components/editor/cms-edit-context.tsx)** with `enabled: true` so section components can call **`useCmsEdit()`** and patch the snapshot.
- **Review mode** uses the same render tree with `CmsEditProvider` **`enabled: false`** (read-only preview).

### Persistence

- Draft save uses [`saveHomepageDraft`](../src/features/homepage-cms/api/draft-client.ts) → `/api/admin/template-content` with `page:home`.
- **Note for maintainers:** the homepage draft/publish clients currently send a **fixed** `templateId` of [`FALLBACK_TEMPLATE_ID`](../src/templates/registry.ts), while the server page loads the **active** template’s draft. When adding multi-template homepage support, align these IDs.

---

## Rendering path: snapshot → sections

[`RealHomepageSections`](../src/features/homepage-cms/render/RealHomepageSections.tsx):

1. For each **semantic block type** (`hero`, `about`, `productGrid`, …), it takes the **first enabled** block of that type (`getBlockData`).
2. It maps `data` into **shared** section components: [`Hero`](../src/components/sections/Hero.tsx), [`Story`](../src/components/sections/Story.tsx), [`Shop`](../src/components/sections/Shop.tsx), [`Features`](../src/components/sections/Features.tsx), [`Reviews`](../src/components/sections/Reviews.tsx), [`Contact`](../src/components/sections/Contact.tsx).
3. **Section order on the page is fixed** in this file (hero → about → shop grid → features → testimonials → contact). **Reordering `snapshot.blocks` does not reorder these sections** unless you change `RealHomepageSections` (or replace it with a block iterator).
4. **Multiple blocks of the same `type`** in the snapshot are **not** all rendered independently on the storefront; only the first enabled match per type is used here.

Templates that want a **different layout** should still hydrate the same snapshot shape if they stay on `homepage-blocks`, but must replace or fork `home.Render` / section mapping to interpret `blocks[]` correctly.

---

## How inline editing works (texts, lists, icons, images)

### Context API

[`CmsEditProvider`](../src/features/homepage-cms/components/editor/cms-edit-context.tsx) exposes:

- **`updateField(blockType, field, value)`** — finds the **first enabled** block with that `type`, then merges `value` into `block.data[field]` via Zustand [`updateBlockField`](../src/features/homepage-cms/store/editor-store.ts).
- **`patchBlockData(blockType, patch)`** — same targeting rule, merges an object into `data`.

**Implication:** inline editors key off **`blockType`**, not `block.id`. If two `hero` blocks exist, inline edits always hit the **first enabled** `hero`. Prefer a single enabled block per type on the homepage, or extend the context API to pass `blockId`.

### Primitives (reuse these patterns on other pages if you want parity)

| Primitive | Role |
|-----------|------|
| [`EditableTextInline`](../src/features/homepage-cms/components/primitives/EditableTextInline.tsx) | Single-line `input` or multiline `textarea`; commits on **blur** via `updateField`. |
| [`EditableLinkInline`](../src/features/homepage-cms/components/primitives/EditableLinkInline.tsx) | Link URL + label where used (e.g. hero CTAs). |
| [`EditableImage`](../src/features/homepage-cms/components/primitives/EditableImage.tsx) | Image URL editing in context. |
| [`EditableListInline`](../src/features/homepage-cms/components/primitives/EditableListInline.tsx) | Array fields (e.g. about **accordions**) with add/remove/reorder patterns. |
| [`IconPicker`](../src/features/homepage-cms/components/primitives/IconPicker.tsx) + [`DynamicLucideIcon`](../src/features/homepage-cms/components/primitives/IconPicker.tsx) | Lucide icon name pickers; names must resolve against `lucide-react/dynamicIconImports`. |

### Icons and structured strings

- **Feature / about cards** often store `icon?: string` (Lucide icon name).
- **Hero badges** can use the `"IconName:Visible text"` convention (see parsing in [`Hero.tsx`](../src/components/sections/Hero.tsx) — `parseBadge` / `formatBadge`).

### Store + autosave

- Edits set **`dirty`** and push history for undo/redo.
- **`useEffect`** debounces **`saveHomepageDraft(snapshot)`** (~1.5s) while dirty.
- Keyboard: **⌘/Ctrl+S** save draft, **⌘/Ctrl+Z** undo, **⇧⌘Z** redo (see `VisualHomepageEditor`).

---

---

## Checklist: implementing or reviewing a template homepage

1. **`cmsPageKind: "homepage-blocks"`** on `pages.home` if you want **`VisualHomepageEditor`**.
2. **`schema` + `defaultContent`** aligned with `HomepageSnapshot` (or consciously fork the schema and admin if you intentionally break compatibility).
3. **`home.Render`** is a client subtree that:
   - accepts `content` + `deps`,
   - works with **`CmsEditProvider`** when wrapped by `VisualHomepageEditor`,
   - uses **`useCmsEdit()`** in leaf components where inline editing is desired (`enabled === false` on the live site).
4. **Do not rely on `pages/home/EditorPanel.tsx`** for the main UX; operators use **`/admin/cms/home`**.
5. If you need **structured arrays** or **icons**, mirror primitives from `features/homepage-cms/components/primitives/` and **`patchBlockData`** for multi-key updates where needed (see **[`Hero.tsx`](../src/components/sections/Hero.tsx)** slides).
6. Do **not** expect `/admin/cms` links for non-home routes in this engine.

---

## Related docs and files

- [CREATING_A_TEMPLATE.md](./CREATING_A_TEMPLATE.md) — template module contract; non-home surfaces have no admin CMS in this engine.
- [AI_AGENTS_TEMPLATE_GUIDE.md](./AI_AGENTS_TEMPLATE_GUIDE.md) — agent-oriented checklist.
- Types: [`PageDefinition` / `cmsPageKind`](../src/templates/types.ts).
- CMS entry: [`CmsTemplatePageClient`](../src/features/template-cms/components/CmsTemplatePageClient.tsx) → **`VisualHomepageEditor`**.
