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

## Auth (`ENABLE_SHOP=false`)

- **Parents booking a camp** do not need an account; checkout is guest + Stripe.
- **Staff** sign in with Google (or configured providers) at `/api/auth/signin`; only users with role `ADMIN` may open `/admin`.
- Set `BOOTSTRAP_ADMIN_EMAILS=you@example.com` on an empty database for the first admin.
- Footer and navbar show **Bejelentkezés** when logged out, **Admin megnyitása** when logged in as admin.

## Contact form

Homepage **Kapcsolat** section (`#contact`) uses the shared `ContactInquiryForm` with recipients from **CMS → Weboldal beállítások → Kapcsolat e-mailek**. Messages appear under **Admin → Kapcsolat** (same as default-modern).

## Email templates

| Template type | Tags | Used by |
| --- | --- | --- |
| `order_confirmation` | shop, order | Webshop checkout only |
| `camp_registration_confirmation` | camp-booking | Tábor Stripe fizetés után |
| `contact_form_notification` | contact | Kapcsolat űrlap (minden sablon) |

Initialize missing templates at **Admin → Emailek** after enabling `pluginCampBooking`.

## Admin navigation (`ENABLE_SHOP=false`)

- **`/admin`** redirects to **`/admin/plugins/camp-booking/stats`** (plugin KPIs).
- **`/admin/stats`** also redirects to the plugin statistics page.
- There is no webshop dashboard; sidebar shows tábor plugin links + CMS / contact / payment settings.
- Plugin config: `primaryWhenShopDisabled` + `statsSegment: "stats"` on the camp-booking module.

## Admin workflow

1. **Táborok** — create camp, open **Turnusok**.
2. Per turnus: set dates, capacity, publish.
3. **Jegytípusok** — `per_child` or `flat` pricing.
4. **Excel export** — one row per child with report columns.

## Seed demo data

```bash
node scripts/seed/minecraft-camp-demo.mjs
```

## Google login on a fresh database

Auth uses MongoDB collections `users`, `accounts`, and `sessions`. If you copied data from another shop or switched `DATABASE_URL` without restarting the dev server, OAuth can fail with `CallbackRouteError` / `Configuration`.

1. **Restart** `npm run dev` after every `DATABASE_URL` change.
2. Ensure `.env` has `AUTH_URL`, `NEXTAUTH_URL`, `AUTH_SECRET`, and Google keys (see [GOOGLE_OAUTH_SETUP.md](../auth/GOOGLE_OAUTH_SETUP.md)).
3. Set `BOOTSTRAP_ADMIN_EMAILS=your@gmail.com` for the first admin on an empty database.
4. If login still fails, reset OAuth collections (only on the camp database):

```bash
node scripts/auth/reset-oauth-collections.mjs
```

## Registries

- Template: `src/templates/minecraft-camp/`
- Plugin: `src/plugins/camp-booking/`
- Deployment row: `minecraft-camp` in `deployments.config.json`

See [AI_AGENTS_DEPLOYMENT_GUIDE.md](../deployment/AI_AGENTS_DEPLOYMENT_GUIDE.md).
