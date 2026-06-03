# GLS & Foxpost parcel locker integration

This guide covers what you need to run **GLS parcel point picker**, **Foxpost APT picker**, and **admin label/shipment managers** in the webshop engine.

## Admin feature flags (Webshop settings)

Open **Admin → Beállítások** (`/admin/info`) and toggle the four parcel flags.

| Flag key | What it enables |
| --- | --- |
| `glsParcelPicker` | Checkout: GLS map widget (`gls-dpm`) and `gls_fixed` shipping method |
| `glsParcelManager` | Order detail: generate GLS label via MyGLS API |
| `foxpostParcelPicker` | Checkout: Foxpost APT finder iframe and `foxpost_fixed` shipping method |
| `foxpostParcelManager` | Order detail: create Foxpost parcel + download label PDF |

Flags are independent: you can enable GLS checkout only, Foxpost admin only, etc.

Other global flags (shop page, Stripe, newsletter) remain under **Admin → Beállítások** (`/admin/info`).

### Legacy combined flag

Older deployments used a single flag `glsParcelPicker` labelled “GLS / Foxpost” for **both** checkout and admin. On first admin load after upgrade, if that legacy description is still in the database and the flag was **on**, all four new flags are turned **on** and labels/descriptions are updated.

---

## Shared prerequisites

1. **Shop page** enabled (`shopPage` flag) — commerce must be active.
2. **Shipping methods in admin** (`/admin/shipping`):
   - Create an **active** method whose **name** matches env (defaults below).
   - Set gross price (shown at checkout).
3. **Territory**: GLS/Foxpost flows target **Hungary**; Foxpost requires a valid **HU mobile** on the order (`+36 20/30/31/70/50/51…`).
4. **Deploy env**: set variables on the host (Vercel, Docker, `.env.local` for dev).

---

## GLS

### What each flag does

- **Picker** — Customer selects a GLS parcel point on checkout (`https://map.gls-hungary.com/widget/gls-dpm.js`). Order stores `glsParcelPoint`.
- **Manager** — Staff opens the order in admin and clicks **GLS címke generálása** (MyGLS `PrintLabels`).

### Shipping method (admin + price)

In **Admin → Szállítás**, create an active method with type **GLS csomagpont** (or legacy: exact name below). Set the **bruttó ár** there — checkout shows that price and still opens the map picker when the customer selects it.

Default name fallback: **`GLS Csomagpont`** (`GLS_SHIPPING_METHOD_NAME` env override).

### Required environment variables

| Variable | Purpose |
| --- | --- |
| `GLS_API_USERNAME` | MyGLS API user |
| `GLS_API_PASSWORD` | MyGLS API password |
| `GLS_CLIENT_NUMBER` | GLS client / customer number |
| `GLS_PICKUP_NAME` | Sender name (your warehouse / shop) |
| `GLS_PICKUP_STREET` | Sender street |
| `GLS_PICKUP_HOUSE_NUMBER` | Sender house number |
| `GLS_PICKUP_CITY` | Sender city |
| `GLS_PICKUP_ZIP` | Sender ZIP |

### Optional environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `GLS_API_BASE_URL` | `https://api.test.mygls.hu` | API endpoint (use production URL in live) |
| `GLS_WEBSHOP_ENGINE` | `krausz-webshop` | Webshop identifier sent to GLS |
| `GLS_PRINTER_TYPE` | `A4_2x2` | Label layout |
| `GLS_PICKUP_HOUSE_NUMBER_INFO` | — | Extra address line |
| `GLS_PICKUP_COUNTRY_ISO` | `HU` | Pickup country |
| `GLS_PICKUP_CONTACT_NAME` | — | Pickup contact |
| `GLS_PICKUP_CONTACT_PHONE` | — | Pickup phone |
| `GLS_PICKUP_CONTACT_EMAIL` | — | Pickup email |

### GLS checklist

- [ ] `glsParcelPicker` and/or `glsParcelManager` enabled in `/admin/info`
- [ ] Active shipping method in admin with type **GLS csomagpont** (and price set)
- [ ] MyGLS credentials and pickup address in env
- [ ] Test checkout: select GLS → pick point → place order
- [ ] Test admin: open parcel order → generate label → open PDF link

---

## Foxpost

### What each flag does

- **Picker** — Checkout embeds Foxpost **APT finder** (`https://cdn.foxpost.hu/apt-finder/v1/app/`). Selection is stored as `foxpostParcelPoint` (`operator_id` / APM id).
- **Manager** — Admin creates parcel via FoxWeb API (`POST /parcel`), then label (`POST /label/{pageSize}`). PDF is stored on the order and served at `/api/admin/orders/{id}/foxpost-label`.

### Shipping method (admin + price)

Create an active method with type **Foxpost automata** in admin (or legacy name match). Price is taken from that row.

Default name fallback: **`Foxpost Csomagautomata`** (`FOXPOST_SHIPPING_METHOD_NAME` env override).

### Required environment variables

| Variable | Purpose |
| --- | --- |
| `FOXPOST_API_USERNAME` | Basic auth user (Foxpost merchant settings) |
| `FOXPOST_API_PASSWORD` | Basic auth password |
| `FOXPOST_API_KEY` | `api-key` header value |

### Optional environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `FOXPOST_API_BASE_URL` | `https://webapi-test.foxpost.hu/api` | Sandbox vs production API |
| `FOXPOST_PARCEL_SIZE` | `M` | Size at parcel create |
| `FOXPOST_LABEL_PAGE_SIZE` | `A6` | Label PDF: `A6`, `A7`, `_85X85` |
| `FOXPOST_IS_WEB` | `false` | Set `true` for `isWeb=true` on create (often required in production) |

### Foxpost checklist

- [ ] `foxpostParcelPicker` and/or `foxpostParcelManager` enabled
- [ ] Active shipping method in admin with type **Foxpost automata** (and price set)
- [ ] Foxpost API credentials in env (sandbox first)
- [ ] Checkout phone is valid HU mobile
- [ ] Test checkout: Foxpost method → APT finder → place order
- [ ] Test admin: generate parcel + label; download PDF

---

## Checkout behaviour summary

```
GET /api/checkout/methods
  → if glsParcelPicker + configured GLS shipping row → adds gls_fixed
  → if foxpostParcelPicker + configured Foxpost row → adds foxpost_fixed

Order validation
  → gls_fixed requires glsParcelPicker + glsParcelPoint
  → foxpost_fixed requires foxpostParcelPicker + foxpostParcelPoint
```

Standard home-delivery methods are unchanged.

---

## Admin orders

- **Orders list** — shipping type column / filter (GLS, Foxpost, standard) and “missing label” style badges when manager flags are on.
- **Order detail** — “Csomagpont szállítás” panel per provider when the order used that locker and the matching **manager** flag is enabled.
- **Bulk labels** (when a manager flag is on) — select orders on the list, then **Címkék generálása (kijelöltek)**. Only orders **without** an existing label are processed; GLS and Foxpost are detected per order.
- **Excel export** — includes `GLS címke link` / `Foxpost címke link` columns (absolute URLs). Opening a link requires an **admin session** in the browser.
- **Label ZIP** — **Címkék ZIP (szűrés)** uses the current list filters; **Címkék ZIP (kijelöltek)** downloads PDFs for selected orders that already have stored label data.

If managers are off, parcel point data is still shown but label buttons are hidden.

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| No GLS/Foxpost at checkout | Picker flag off, or no active shipping method with matching name |
| “Szállítási mód nem támogatott” on submit | Picker flag off while customer still has old session / cached methods |
| GLS label fails | Missing/invalid MyGLS env or pickup fields |
| Foxpost create fails | Wrong API env, invalid phone, or sandbox `isWeb` requirement |
| Foxpost label fails but parcel exists | Partial success — retry label from admin; `clFoxId` may already be stored |

---

## Related code

| Area | Path |
| --- | --- |
| Flag helpers | `src/lib/parcel-feature-flags.ts` |
| Checkout methods API | `src/app/api/checkout/methods/route.ts` |
| Validation | `src/services/checkout-validation.ts` |
| GLS service | `src/services/gls.ts` |
| Foxpost service | `src/services/foxpost.ts` |
| Admin UI | `src/components/admin/OrderParcelPanel.tsx` |
| Admin flags (Beállítások) | `src/app/admin/info/page.tsx` |
