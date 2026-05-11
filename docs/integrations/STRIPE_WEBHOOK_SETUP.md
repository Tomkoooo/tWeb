# Stripe webhook setup (webshop-engine)

This guide walks through creating a Stripe webhook that points at this app, which events to enable, and how the API version should line up with the server SDK.

## What the webhook does

The app receives Stripe events at:

`https://<your-public-domain>/api/stripe/webhook`

It verifies the `Stripe-Signature` header using `STRIPE_WEBHOOK_SECRET`, then runs idempotent handlers (inventory holds, order finalization, refunds on finalize failure). See `src/app/api/stripe/webhook/route.ts` and `src/services/stripe-webhook-handlers.ts`.

## API version to use

Stripe lets each **webhook endpoint** pin an **API version**. Event payloads match that version’s shape.

This project uses the official **`stripe` npm package** without passing a custom `apiVersion` in code (`src/services/stripe.ts`). The library pins a default API version at build time.

**As of `stripe@20.4.1` in this repo**, that default is:

`2026-02-25.clover`

**How to confirm after upgrading `stripe`:**

```bash
node -e "const Stripe=require('stripe'); console.log(Stripe.API_VERSION)"
```

This prints the API version string embedded in the installed SDK (no valid secret required).

**Dashboard recommendation:** when you add a webhook endpoint in Stripe, set its API version to **match** the version above (or upgrade your account default and the `stripe` package together so they stay aligned). Mismatches can cause subtle shape differences in `event.data.object`.

## Step-by-step: Dashboard webhook (test or live)

1. **Open Stripe Dashboard**  
   Use [Test mode](https://docs.stripe.com/test-mode) toggle for development, or Live mode for production.

2. **Go to Developers → Webhooks**  
   Direct link pattern: `https://dashboard.stripe.com/test/webhooks` (swap `test` for your account path as needed).

3. **Add endpoint**  
   - **Endpoint URL:** `https://<your-domain>/api/stripe/webhook`  
     Use HTTPS in production. For local tunnels, use your tunnel URL with the same path.

4. **Choose events to send**  
   Click **Select events** (not “Send all events” unless you intend to filter noise). Subscribe to at least:

   | Event | Purpose in this app |
   | --- | --- |
   | `checkout.session.completed` | Payment succeeded (card); confirm holds + finalize order |
   | `checkout.session.async_payment_succeeded` | Async payment methods succeeded |
   | `checkout.session.expired` | Checkout session timed out; release inventory hold |
   | `checkout.session.async_payment_failed` | Async payment failed; release hold |
   | `payment_intent.canceled` | PaymentIntent canceled (e.g. abandoned flow); release hold when session events are delayed |

5. **API version for this endpoint**  
   In the endpoint creation UI, set **API version** to the same version your `stripe` package uses (see [API version to use](#api-version-to-use) above).

6. **Create the endpoint**  
   After saving, open the endpoint details.

7. **Reveal signing secret**  
   Under **Signing secret**, click **Reveal** and copy the value (`whsec_...`).

8. **Configure the app**  
   Set in your environment (e.g. `.env`):

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_SECRET_KEY=sk_test_...   # or sk_live_... for production
   ```

9. **Deploy and test**  
   Use **Send test webhook** in the Dashboard for a single event type, or complete a real test checkout. Check your app logs for handler errors.

## Local development: Stripe CLI

1. [Install Stripe CLI](https://docs.stripe.com/stripe-cli).

2. **Login**

   ```bash
   stripe login
   ```

3. **Forward events to your Next dev server**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** the CLI prints (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `.env`. This secret is **different** from the Dashboard endpoint secret for the same path.

5. **Trigger events** (optional):

   ```bash
   stripe trigger checkout.session.completed
   ```

   For a full flow, use your app’s checkout UI so metadata and PaymentIntent wiring match production.

## Environment variables (summary)

| Variable | Role |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server API key (`sk_test_...` / `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Verifies `Stripe-Signature` for `/api/stripe/webhook` |

Optional inventory / sweeper variables are documented in the main [README](../../README.md) (Stripe + reservation sections).

## Troubleshooting

- **400 “Missing stripe signature”** — Request did not come from Stripe with `stripe-signature` (or a proxy stripped headers).
- **400 signature / constructEvent errors** — Wrong `STRIPE_WEBHOOK_SECRET` (CLI vs Dashboard mix-up) or body was parsed as JSON before verification (this route uses raw body; do not wrap with JSON middleware that consumes the body first).
- **200 but no order** — Check subscribed events, API version, and that `checkout.session.completed` / async success events include your session metadata (`tempOrderId` is set on Checkout Session and PaymentIntent at session creation).
