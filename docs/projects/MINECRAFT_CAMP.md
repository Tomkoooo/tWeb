# Minecraft camp booking project

Reference deployment exercising **templates**, **plugins**, and **`deployments.config.json`**.

## Environment

```bash
DEPLOYMENT_KEY=minecraft-camp
DATABASE_URL=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

Enable in admin (**Beállítások**):

- `pluginCampBooking`
- `stripePayments`

`ENABLE_SHOP` may be `true` or `false`; camp checkout uses `/api/plugins/camp-booking/*`, not the product cart.

## URLs

| URL | Purpose |
| --- | --- |
| `/` | Camp list (minecraft-camp template) |
| `/foglalas/{sessionId}` | Booking wizard |
| `/foglalas/siker` | Post-Stripe success |
| `/admin/plugins/camp-booking` | Admin |

Shop routes (`/shop`, `/cart`, …) return **404** in camp-only mode.

## Admin workflow

1. **Táborok** — create camp, open **Turnusok**.
2. Per turnus: set dates, capacity, publish.
3. **Jegytípusok** — `per_child` or `flat` pricing.
4. **Excel export** — one row per child with report columns.

## Seed demo data

```bash
node scripts/seed/minecraft-camp-demo.mjs
```

## Registries

- Template: `src/templates/minecraft-camp/`
- Plugin: `src/plugins/camp-booking/`
- Deployment row: `minecraft-camp` in `deployments.config.json`

See [AI_AGENTS_DEPLOYMENT_GUIDE.md](../deployment/AI_AGENTS_DEPLOYMENT_GUIDE.md).
