# Google Tag Manager, GA4, and Meta Pixel

Storefront analytics are **consent-gated**: GTM and Meta load only after the visitor accepts marketing cookies. The app pushes [GA4 recommended ecommerce events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce) to `window.dataLayer`; your marketing team maps them to GA4 (and optional Google Ads) inside GTM.

## Environment variables

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_GTM_ID` | Yes (for GTM) | `GTM-KZNTSD4M` | Google Tag Manager container |
| `NEXT_PUBLIC_META_PIXEL_ID` | Yes (for Meta) | `1618980845831904` | Meta Pixel ID |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | No | `true` | Set to `false` to disable all marketing tags |

At least one of GTM or Meta IDs should be set. Analytics is enabled by default when IDs are present.

## dataLayer events (from the app)

| Event | When |
| --- | --- |
| `page_view` | Every storefront route change (SPA) |
| `view_item_list` | `/shop` listing loaded |
| `select_item` | Product card click → PDP |
| `view_item` | Product detail / variant change |
| `add_to_cart` | Item added to cart |
| `remove_from_cart` | Line removed |
| `view_cart` | `/cart` |
| `begin_checkout` | `/checkout` |
| `purchase` | `/checkout/success` (once per order) |
| `press_portal_login` | Press-kit `/sajto` — successful journalist login |
| `press_page_view` | Press-kit portal content viewed |
| `press_pdf_view` | Press-kit comic PDF opened or page turned |

Ecommerce payloads use `currency: HUF` and GA4 `items[]` (`item_id`, `item_name`, `price`, `quantity`, `item_variant`).

### Press-kit (sajtóportál) GTM notes

Map custom events `press_portal_login`, `press_page_view`, and `press_pdf_view` to GA4 Event tags. Suggested event parameters (register as custom dimensions in GA4):

- `press_contact_id`
- `press_outlet`
- `press_name`
- `page_section` (for `press_page_view`)
- `pdf_page` (for `press_pdf_view`)

Press events are pushed to `dataLayer` without requiring marketing cookie consent on `/sajto` routes. Disclose measurement in the press invite email.

Consent events: `consent_default` (denied) before choice, `consent_update` (granted) after accept.

## GTM setup (marketing team)

1. Create or open container `GTM-KZNTSD4M`.
2. Add **GA4 Configuration** tag with your Measurement ID (`G-XXXXXXXX`).
   - Trigger: **Consent Initialization – All Pages** or a custom trigger on `consent_update` / first `page_view` after consent.
   - Enable consent checks if using Google’s consent mode tags.
3. Add **GA4 Event** tags (one per event or one tag with lookup table), triggered on **Custom Event** matching the event name above. Map `ecommerce` variables from the dataLayer.
4. **Do not** add a duplicate Meta Pixel HTML tag if the site loads Meta via `NEXT_PUBLIC_META_PIXEL_ID` (double counting).
5. Publish the container and test with **GTM Preview**.

### Example GA4 Event tag (purchase)

- Tag type: Google Analytics: GA4 Event  
- Event name: `purchase`  
- Trigger: Custom Event → Event name equals `purchase`  
- Event parameters: map `transaction_id`, `value`, `currency`, `items` from the dataLayer ecommerce object.

## Meta Pixel

The app loads `fbevents.js` and sends standard events:

| Meta event | App trigger |
| --- | --- |
| `PageView` | Route changes |
| `ViewContent` | PDP, shop list, product click |
| `AddToCart` | Add to cart |
| `InitiateCheckout` | Checkout page |
| `Purchase` | Order success |

Verify in [Meta Events Manager](https://business.facebook.com/events_manager) and the Meta Pixel Helper browser extension.

## Testing checklist

- Reject marketing cookies → no requests to `googletagmanager.com` or `connect.facebook.net`.
- Accept marketing → GTM + Meta load; `page_view` on navigation.
- Add to cart → `add_to_cart` in GTM Preview.
- Complete test order (COD and Stripe) → single `purchase` with line items and HUF total.

## Privacy

Link your cookie/privacy policy from the banner (`/privacy`). Update legal copy to mention Google and Meta processing.

## Optional (not implemented in v1)

- Meta Conversions API (server-side)
- Admin UI for per-shop tracking IDs
- Google Ads conversion tags (configure in GTM)
