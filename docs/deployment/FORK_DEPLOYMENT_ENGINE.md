# Fork Deployment Engine Guide

This repository can run as a reusable webshop engine with runtime shop settings.

## 1) Create isolated fork

1. Fork this repository into a new GitHub project for the deployable engine.
2. Keep the current production-connected repository unchanged.
3. Configure CI/CD secrets in the fork only.

## 2) Runtime model

- One deployment = one shop.
- Use the same image/codebase.
- Keep shop-specific data in each deployment database.
- Update branding/theme/SEO from `/admin/info` after first login.
- Set **`DEPLOYMENT_KEY`** to select which row in [`deployments.config.json`](../../deployments.config.json) applies (templates + plugins allowed on that host). See [AI_AGENTS_DEPLOYMENT_GUIDE.md](./AI_AGENTS_DEPLOYMENT_GUIDE.md).

## 3) Required environment variables

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_TRUST_HOST`
- `NEXTAUTH_URL`

Optional but recommended:

- `AUTH_URL`

## 4) Build and publish

GitHub Action publishes images to GHCR with:

- branch tag (`<branch-name>`)
- commit tag (`sha-<short-sha>`)
- `latest` (default branch only)

Use the commit tag for deterministic production deploys.

## 5) First-run bootstrap

1. Deploy container + MongoDB.
2. Run content seed script.
3. Login as admin.
4. Open `/admin/info`.
5. Configure:
   - branding assets and brand name
   - theme colors
   - global SEO and canonical URL

## 6) Safe rollout strategy

- Never deploy directly from local branch state.
- Build image in CI from fork branch/PR.
- Promote a tested SHA tag to production.
- Keep each shop on its own database and env configuration.
