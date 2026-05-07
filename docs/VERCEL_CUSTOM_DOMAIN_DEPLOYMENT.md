# Vercel Deployment with Custom Domain

This guide shows how to deploy this webshop to Vercel and connect your own domain.

## 1) Create the Vercel project

1. Push your code to GitHub (your fork or your own repository).
2. In Vercel, click **Add New... -> Project**.
3. Import the repository.
4. Keep the default **Framework Preset: Next.js**.
5. Deploy once to get a working preview/production URL (for example `my-shop.vercel.app`).

## 2) Configure environment variables

In Vercel project settings, open **Settings -> Environment Variables** and set:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_TRUST_HOST`
- `NEXTAUTH_URL`

Optional but recommended:

- `AUTH_URL`

### Recommended values on Vercel

- Set `NEXT_PUBLIC_APP_URL` to your final public origin (for example `https://shop.example.com`).
- Set `NEXTAUTH_URL` to the same public origin.
- Set `AUTH_TRUST_HOST=true`.
- Use a strong random string for `AUTH_SECRET`.

After adding/changing env vars, trigger a redeploy.

## 3) Connect your custom domain

1. Open **Vercel -> Project -> Settings -> Domains**.
2. Add your domain (for example `example.com`).
3. Add `www.example.com` too if you want both root and `www`.
4. In your DNS provider, create the records Vercel requests (usually one of these):
   - `A` record for apex/root (`@`) -> `76.76.21.21`
   - `CNAME` for `www` -> `cname.vercel-dns.com`
5. Wait for Vercel domain verification to show as valid.

Notes:

- If your DNS is on Cloudflare, disable orange-cloud proxy during initial verification if validation fails.
- DNS propagation may take a few minutes up to 24 hours depending on TTL/provider.

## 4) Set canonical production domain

Choose one canonical hostname and redirect the other:

- `example.com` -> redirect to `www.example.com`, or
- `www.example.com` -> redirect to `example.com`

Configure this in **Vercel Domains** so all traffic is consolidated to one origin.

Then ensure:

- `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` match the canonical domain exactly.
- Google OAuth callback URLs include the canonical domain.

## 5) Update Google OAuth callback URLs

In Google Cloud Console, add/update:

- Authorized JavaScript origins:
  - `https://<your-domain>`
- Authorized redirect URIs:
  - `https://<your-domain>/api/auth/callback/google`

If you also keep the Vercel preview domain for testing, add it separately.

## 6) Verify deployment

1. Open `https://<your-domain>` and confirm homepage loads.
2. Test login with Google.
3. Open `/admin/info` and verify admin page works.
4. Confirm generated links, sitemap, and SEO canonical URL use your custom domain.

## 7) Ongoing deploy flow

- Every push to your configured production branch creates a new Vercel deployment.
- Use preview deployments for testing before merging.
- Keep production secrets only in Vercel Environment Variables (do not commit them).

