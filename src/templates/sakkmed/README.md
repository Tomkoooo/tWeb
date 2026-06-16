# SAKKMED template

Landing-only template for **SAKKMED 2005 Kft.** — rendezvénytechnika, installációk és teljes műszaki kivitelezés. Dark/gold visual language, multi-section homepage, eleven service/project static pages, and a contact inquiry form (no webshop).

Deployment key: `sakkmed` (`ENABLE_SHOP=false`).

Seed demo content from the legacy [Wix site](https://balazsgabor3.wixsite.com/sakkmed2). The seed script crawls every subpage, downloads all images into `public/sakkmed/`, and updates CMS paths to match the original placement (homepage gallery, projects, clients, per-page heroes and galleries).

```bash
node scripts/seed/sakkmed-demo.mjs
```

After re-seeding, restart `npm run dev` so Next.js drops cached homepage/branding snapshots.
