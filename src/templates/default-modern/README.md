# default-modern

The starting template for every webshop fork. Wraps the existing visual block-based homepage editor and the polished dark-mode storefront chrome (`Navbar`, `Footer`).

- Home page is edited at `/admin/cms` via `VisualHomepageEditor` and uses `RealHomepageSections` for rendering.
- Shop and PDP pages have small content schemas (heading, filter position, columns, copy) and are rendered server-side from `pages/shop/Render.tsx` and `pages/pdp/Render.tsx`.
- Theme tokens default to today's dark palette and can be overridden per-shop via the existing theme editor.

To create a sibling template, copy this folder, change `manifest.id` and `manifest.name` in `template.config.ts`, modify chrome/page renderers, then register the new template in `src/templates/registry.ts`.
