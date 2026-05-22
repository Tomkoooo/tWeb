# Webshop Engine

Production-ready Next.js webshop engine for fork-and-deploy workflows with:

- runtime shop customization from `/admin/info` (branding/theme/SEO),
- MongoDB persistence,
- Docker-first deployment,
- optional integrations for payments, shipping, invoicing, and email.

## What This Engine Solves

- **Reusable base**: one codebase, many shop deployments.
- **Safe promotions**: Docker image tags by branch and commit SHA.
- **Runtime branding**: adjust store identity without rebuilding code.
- **Portable hosting**: run with Docker Compose, custom VPS, or Vercel.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- Node.js 20
- MongoDB
- Auth.js / NextAuth (Google provider)
- Docker + Docker Compose

---

## Quick Start (Local Development)

### 1) Install dependencies

```bash
npm install
```

### 2) Create `.env`

Start from this minimal local setup:

```env
DATABASE_URL=mongodb://root:example@localhost:27017/webshop?authSource=admin
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AUTH_SECRET=replace-with-long-random-secret
AUTH_GOOGLE_ID=replace-with-google-client-id
AUTH_GOOGLE_SECRET=replace-with-google-client-secret
```

### 3) Start services

You can run MongoDB with Docker and app in dev mode:

```bash
docker compose up -d mongo
npm run dev
```

Open `http://localhost:3000`.

### 4) First-run setup

1. Sign in.
2. Promote your user to admin in MongoDB if needed.
3. Open `/admin/info`.
4. Configure branding, theme, and SEO values.

---

## Docker Integration

The repository includes:

- `Dockerfile` (multi-stage Next.js production build),
- `docker-compose.yml` (app + MongoDB + uploads volume mapping).

### Run with Docker Compose

1) Create `.env` in project root (see environment variable reference below).  
2) Start the stack:

```bash
docker compose up -d --build
```

3) Check logs:

```bash
docker compose logs -f app
```

4) Stop:

```bash
docker compose down
```

App is exposed on `http://localhost:3000`, MongoDB on `localhost:27017`.

### Persistent Data in Docker

- **Database**: named volume `mongo-data`.
- **Uploads**: bind mount `./uploads:/app/uploads`.

This keeps product images/files between container recreations.

---

## Deployment Guide (Docker/VPS)

## 1) Prepare server

- Install Docker Engine + Docker Compose plugin.
- Open ports (`80/443` via reverse proxy, app internally on `3000`).
- Set up DNS for your domain.

## 2) Configure production `.env`

At minimum:

- `DATABASE_URL` (managed MongoDB or self-hosted Mongo),
- `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` as your canonical HTTPS domain,
- `AUTH_SECRET` strong random secret,
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` with matching callback URL.

## 3) Deploy

```bash
docker compose pull
docker compose up -d --build
```

## 4) Verify

- Homepage loads on your domain.
- Google login works.
- `/admin/info` accessible for admin.
- Media upload and retrieval work.

---

## Environment Variables

Values are grouped by **required core**, **recommended**, and **feature-specific** variables.

### Required Core

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | MongoDB connection string used by the app at startup. App throws if missing. | `mongodb://root:example@mongo:27017/webshop?authSource=admin` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL used in generated links and callbacks. | `https://shop.example.com` |
| `NEXTAUTH_URL` | Yes | Auth.js canonical URL for callback/session handling. | `https://shop.example.com` |
| `AUTH_SECRET` | Yes | Auth.js signing/encryption secret. | `openssl rand -base64 32` output |
| `AUTH_GOOGLE_ID` | Yes (if using built-in login) | Google OAuth client ID. | `123456.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Yes (if using built-in login) | Google OAuth secret. | `your-google-secret` |

### Recommended Auth/Runtime

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `AUTH_URL` | Recommended | Explicit auth origin, useful behind reverse proxies. | `https://shop.example.com` |
| `AUTH_TRUST_HOST` | Recommended | Trust forwarded host headers (`true` for proxy/Vercel setups). | `true` |
| `ENABLE_SHOP` | Optional | Set to `false` to ship this codebase as landing/CMS-only (hides storefront, cart, checkout, profile, shop admin, related APIs). Omit or use any value other than `false` for full commerce. | `false` |

### Admin bootstrap

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `BOOTSTRAP_ADMIN_EMAILS` | Optional | Comma-separated allowlist of emails promoted to ADMIN on first login when no ADMIN exists yet. Remove after onboard. | `you@company.com` |

### Email (for notifications and invoice emails)

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `EMAIL_HOST` | Optional (needed for real email delivery) | SMTP server hostname. | `smtp.sendgrid.net` |
| `EMAIL_PORT` | Optional | SMTP port. | `587` |
| `EMAIL_USER` | Optional | SMTP username. | `apikey` |
| `EMAIL_PASS` | Optional | SMTP password/token. | `***` |
| `EMAIL_FROM` | Optional | Sender address used by transactional mail. | `no-reply@shop.example.com` |

### Stripe (enable payments/webhooks)

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Required when Stripe features are used | Server-side Stripe API access. | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Required when Stripe webhooks are enabled | Signature validation for webhook endpoint. | `whsec_...` |

**Webhooks:** point Stripe at `https://<your-domain>/api/stripe/webhook` and subscribe to the events listed in [docs/integrations/STRIPE_WEBHOOK_SETUP.md](docs/integrations/STRIPE_WEBHOOK_SETUP.md) (including `payment_intent.canceled` for hold release when Checkout session events are delayed). That doc also covers **API version** alignment with the `stripe` npm package and step-by-step Dashboard setup. For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli) (`stripe listen --forward-to localhost:3000/api/stripe/webhook`) and paste the CLI signing secret into `STRIPE_WEBHOOK_SECRET` (it differs from the Dashboard endpoint secret).

**Inventory holds (Stripe checkout):** stock is reserved when the Checkout Session is created. Optional tuning (defaults are safe with Stripe’s minimum session lifetime):

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `RESERVATION_TTL_MIN_MS` | Optional | Minimum hold duration (ms). Default 30 minutes (aligns with Stripe). | `1800000` |
| `RESERVATION_TTL_MAX_MS` | Optional | Maximum hold (ms). Default 60 minutes. | `3600000` |
| `RESERVATION_STRIPE_SESSION_BUFFER_SEC` | Optional | Stripe session ends this many seconds before DB hold. Default `60`. | `60` |
| `CRON_SECRET` | Optional | Bearer secret for `POST /api/internal/reservations/sweep` to release expired pending holds. | long random string |

### GLS Shipping (enable GLS label generation)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GLS_API_USERNAME` | Required for GLS | GLS API username |
| `GLS_API_PASSWORD` | Required for GLS | GLS API password |
| `GLS_CLIENT_NUMBER` | Required for GLS | GLS client/customer number |
| `GLS_PICKUP_NAME` | Required for GLS | Pickup point/company name |
| `GLS_PICKUP_STREET` | Required for GLS | Pickup street |
| `GLS_PICKUP_HOUSE_NUMBER` | Required for GLS | Pickup house number |
| `GLS_PICKUP_CITY` | Required for GLS | Pickup city |
| `GLS_PICKUP_ZIP` | Required for GLS | Pickup ZIP/postcode |
| `GLS_API_BASE_URL` | Optional | API URL (defaults to test endpoint) |
| `GLS_WEBSHOP_ENGINE` | Optional | Webshop identifier sent to GLS |
| `GLS_PRINTER_TYPE` | Optional | Label format (default `A4_2x2`) |
| `GLS_PICKUP_HOUSE_NUMBER_INFO` | Optional | Extra house number info |
| `GLS_PICKUP_COUNTRY_ISO` | Optional | Pickup country ISO (default `HU`) |
| `GLS_PICKUP_CONTACT_NAME` | Optional | Pickup contact person |
| `GLS_PICKUP_CONTACT_PHONE` | Optional | Pickup contact phone |
| `GLS_PICKUP_CONTACT_EMAIL` | Optional | Pickup contact email |
| `GLS_SHIPPING_METHOD_NAME` | Optional | Display name for GLS shipping method |

### GLS / Foxpost parcel locker (optional)

Enable the four flags under **Admin → Webshop beállítások → GLS / Foxpost** (`/admin/shop/flags`): GLS/Foxpost **picker** (checkout) and **manager** (admin labels). Full setup: [`docs/integrations/parcel-locker-gls-foxpost.md`](docs/integrations/parcel-locker-gls-foxpost.md).

Create active shipping methods named `GLS Csomagpont` and/or `Foxpost Csomagautomata` (or override `GLS_SHIPPING_METHOD_NAME` / `FOXPOST_SHIPPING_METHOD_NAME`).

Checkout uses the official Foxpost APT finder iframe (`cdn.foxpost.hu`). Admin order detail can create parcels and download labels via FoxWeb API.

| Variable | Required | Description |
| --- | --- | --- |
| `FOXPOST_API_USERNAME` | Required for Foxpost | Basic auth username (from foxpost.hu Beállítások) |
| `FOXPOST_API_PASSWORD` | Required for Foxpost | Basic auth password |
| `FOXPOST_API_KEY` | Required for Foxpost | API key header value |
| `FOXPOST_API_BASE_URL` | Optional | API base (default sandbox `https://webapi-test.foxpost.hu/api`) |
| `FOXPOST_SHIPPING_METHOD_NAME` | Optional | DB shipping method name to match (default `Foxpost Csomagautomata`) |
| `FOXPOST_PARCEL_SIZE` | Optional | Parcel size at create time (default `M`) |
| `FOXPOST_LABEL_PAGE_SIZE` | Optional | Label PDF size: `A6`, `A7`, `_85X85` (default `A6`) |
| `FOXPOST_IS_WEB` | Optional | Set `true` to pass `isWeb=true` on parcel create (default `false` on sandbox) |

### Számlázz.hu Invoicing (optional)

Set one authentication mode:

- `SZAMLAZZ_AGENT_KEY`, **or**
- `SZAMLAZZ_USER` + `SZAMLAZZ_PASSWORD`

Optional invoicing settings:

- `SZAMLAZZ_TIMEOUT_MS`
- `SZAMLAZZ_SELLER_BANK_NAME`
- `SZAMLAZZ_SELLER_BANK_ACCOUNT`
- `SZAMLAZZ_ISSUER_NAME`
- `SZAMLAZZ_EMAIL_SUBJECT`
- `SZAMLAZZ_EMAIL_MESSAGE`

### Newsletter

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | Optional (recommended) | Secret token for unsubscribe verification fallback. |

---

## Common Commands

```bash
# Development
npm run dev

# Concurrency / inventory race tests (Mongo memory server; not run in default `npm test` or the Docker CI unit job)
npm run test:concurrency

# Optional: parallel Stripe Checkout Session race (live Stripe test mode). `vitest.concurrency.config.ts` loads
# `.env` from the repo root (Vitest does not do this by default). Set `RUN_STRIPE_RACE_TESTS` to `1`, `true`,
# or `yes`, and `STRIPE_SECRET_KEY` in `.env` (or export them in the shell). Stripe CLI is only needed if you
# assert webhook-driven behavior; see tests/concurrency/stripe-checkout-race.test.ts.
npm run test:concurrency

# Production build
npm run build
npm run start

# Lint
npm run lint

# Tests
npm run test
```

---

## Additional Documentation

See **[docs/README.md](docs/README.md)** for the full index. Quick links:

- Fork / deployment engine: [docs/deployment/FORK_DEPLOYMENT_ENGINE.md](docs/deployment/FORK_DEPLOYMENT_ENGINE.md)
- Vercel + custom domain: [docs/deployment/VERCEL_CUSTOM_DOMAIN_DEPLOYMENT.md](docs/deployment/VERCEL_CUSTOM_DOMAIN_DEPLOYMENT.md)
- Portability: [docs/deployment/PORTABILITY.md](docs/deployment/PORTABILITY.md)
- Google OAuth: [docs/auth/GOOGLE_OAUTH_SETUP.md](docs/auth/GOOGLE_OAUTH_SETUP.md)
- Auth PKCE verification: [docs/auth/AUTH_PKCE_VERIFICATION.md](docs/auth/AUTH_PKCE_VERIFICATION.md)
- Stripe webhooks: [docs/integrations/STRIPE_WEBHOOK_SETUP.md](docs/integrations/STRIPE_WEBHOOK_SETUP.md)
- Számlázz.hu invoicing: [docs/integrations/szamlazzhu-integration.md](docs/integrations/szamlazzhu-integration.md)
- Templates (human spec + agent brief): [docs/templates/CREATING_A_TEMPLATE.md](docs/templates/CREATING_A_TEMPLATE.md), [docs/templates/AI_AGENTS_TEMPLATE_GUIDE.md](docs/templates/AI_AGENTS_TEMPLATE_GUIDE.md)
- Homepage block CMS: [docs/cms/HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md](docs/cms/HOMEPAGE_BLOCKS_CMS_ARCHITECTURE.md)
