# Auth PKCE Verification Matrix

Use this checklist after OAuth config changes to confirm Google login stability.

## Preconditions

- Set one canonical host in `.env` (`AUTH_URL` and `NEXTAUTH_URL` must match).
- Keep `AUTH_TRUST_HOST=true`.
- Ensure Google OAuth Console includes matching origin + callback URI for the same host.

## Quick smoke checks

1. Start app: `npm run dev`
2. Verify session endpoint works:
   - `curl -s -D - -o /dev/null "http://localhost:3000/api/auth/session"`
   - Expect `200 OK` and `Set-Cookie` headers for `authjs.csrf-token` and `authjs.callback-url`.
3. Confirm callback diagnostics appear when Google returns:
   - Look for `[auth][diagnostic] Google callback request` in server logs.
   - On failures, look for `[auth][diagnostic] InvalidCheck during OAuth check`.

## Browser test matrix

Run all cases on the same canonical host (do not mix localhost/ngrok/prod in one flow).

- Existing Google account, normal browser window
- New Google account, normal browser window
- Existing Google account, incognito/private window
- Existing Google account, mobile browser

For each case:

1. Start login from the canonical host.
2. Complete Google consent and return to app.
3. Confirm user session exists and protected pages load.
4. Confirm no `InvalidCheck` error in server logs.

## Failure triage

If `InvalidCheck: pkceCodeVerifier` appears:

- Compare login start host and callback host (must be identical).
- Check callback request diagnostics:
  - `host`
  - `x-forwarded-host`
  - `x-forwarded-proto`
  - `nextUrlOrigin`
- Verify Google callback URI exactly matches the runtime host:
  - `<origin>/api/auth/callback/google`
