# Agent playbook: import customer copy into CMS

Use this when a customer sends marketing copy (email, doc, website text) and you need it in **shop CMS / template content** without hand-editing every field in the admin UI.

## Rules

1. **Template is mandatory** — The user must say which template they work on (`default-modern`, `atelier-showcase`, …). Never guess from repo files alone.
2. **Inspect before mapping** — Run `cms:inspect` for that template so you know which blocks/pages exist and what is already saved.
3. **You decide placement** — Raw paste text is not auto-imported. You map sections to `blockPatches`, `content`, or full `replace` payloads.
4. **Draft by default** — Apply without `--publish` so operators can preview at `/admin/cms`. Use `--publish` only when the user explicitly wants live content.

## Step-by-step

### 1. Capture customer text

```bash
cp scripts/imports/customer-copy.txt.example scripts/imports/customer-copy.txt
```

Paste the customer’s text into `scripts/imports/customer-copy.txt`. Comment lines starting with `#` are for notes only.

### 2. Inspect current CMS (required)

```bash
npm run cms:inspect -- --template=<template-id>
```

Add `--json` if you want compact output for tooling.

The report includes:

- **adminCmsRoutes** — URLs under `/admin/cms/...`
- **importablePageKeys** — `page:home`, `page:shop`, static slugs, flow shells, with draft/published meta and text previews
- **homepageBlockFieldGuide** — which fields exist per block type for this template
- **templateMismatchWarning** — if DB active template ≠ requested template

Read [HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md](./HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md) for block editor behavior.

### 3. Build `payload.json`

Copy `scripts/imports/payload.example.json` → `scripts/imports/payload.json` and edit.

Payload contract (`version: 1`):

| Field | Meaning |
|-------|---------|
| `pages[].pageKey` | e.g. `page:home`, `page:shop`, `page:editorial` |
| `pages[].mode` | `merge` (default) or `replace` |
| `pages[].blockPatches` | Homepage only: patch blocks by `type` or `id` |
| `pages[].content` | Partial (merge) or full (replace) page JSON |
| `publish` | `true` to publish after apply (CLI `--publish` overrides file) |

**Homepage blocks** (`page:home` + `homepage-blocks`):

- Prefer `blockPatches` with `matchBy: "type"` and `target: "hero" | "about" | …` for single-block sections.
- Use `matchBy: "id"` when the template has multiple blocks of the same type.
- Set `meta.seoTitle` / `meta.seoDescription` via `content.meta` in merge mode.

**Shop / PDP / static / flow shells**:

- Use `pageKey` from inspect (e.g. `page:shop`, `page:editorial`).
- `merge` + partial `content` updates top-level schema fields only.
- `replace` requires a full valid object for that page schema.

### 4. Validate (dry run)

```bash
npm run cms:apply-import -- --template=<template-id> --payload=scripts/imports/payload.json --dry-run
```

Fix Zod validation errors before writing.

### 5. Apply

```bash
npm run cms:apply-import -- --template=<template-id> --payload=scripts/imports/payload.json
```

Tell the user to open `/admin/cms/home` (and other surfaces from the inspect report) to review the draft.

### 6. Publish (optional)

```bash
npm run cms:apply-import -- --template=<template-id> --payload=scripts/imports/payload.json --publish
```

Or publish from the admin CMS UI.

## What this does *not* change

- **Branding / theme / footer** — still `/admin/info`, `/admin/theme`, homepage editor side panels.
- **Products / categories** — use product admin or seed scripts, not this import.
- **Legacy `ShopContent` keys** — old flat keys; live homepage uses `TemplateContent` + homepage snapshot. See [legacy-shop-content-field-inventory.md](./legacy-shop-content-field-inventory.md).

## Registered templates

Check `src/templates/registry.ts` for ids available in this build.
