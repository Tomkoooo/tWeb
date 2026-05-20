# Multi-customer templates: deploys, isolation, and sharing

This document explains how **layout templates** interact with **deployment** when you operate many customers on the same engine codebase, and what options exist if you want **per-customer template changes** without **redeploying every customer**. It also covers a **community / shared template registry** and the tradeoffs involved.

For how templates are built today, see [CREATING_A_TEMPLATE.md](./CREATING_A_TEMPLATE.md). For the fork-per-shop deployment model, see [deployment/FORK_DEPLOYMENT_ENGINE.md](../deployment/FORK_DEPLOYMENT_ENGINE.md).

---

## How the engine works today

- Templates are **TypeScript modules** under `src/templates/`. Each template exports a `TemplateModule`: React components (chrome, pages, flow routes, optional commerce slots), theme defaults, CMS/editor wiring, and a manifest (id, version, capabilities).
- **All templates that exist in a given build** are imported in [`src/templates/registry.ts`](../../src/templates/registry.ts). The running binary contains every registered template.
- At runtime, [`TemplateService`](../../src/services/template.ts) reads **which template id is active** from the database (`ActiveTemplate`). It does **not** download template code over the network.

**Implications:**

1. **Adding or changing a template’s code** requires **rebuilding and redeploying** that deployment’s artifact, because the components are compiled into the Next.js app.
2. If you run **one** production deployment and activate different template ids for different customers **from the same database**, you still only have the templates that were **shipped in that build**. Multiple tenants in one app is a **data** separation problem; templates are still **whatever was in the registry at build time**.
3. If you run **five separate deployments** (recommended in [FORK_DEPLOYMENT_ENGINE.md](../deployment/FORK_DEPLOYMENT_ENGINE.md): one shop per deploy, one database per deploy), then **Customer A’s redeploy does not touch Customer B’s servers**—unless they share a single monolithic pipeline that redeploys all five on every merge (that’s a CI/CD choice, not a requirement of the engine).

---

## Your scenario: five customers, five bespoke templates

### Problem A — “One change retriggers everyone”

This happens when:

- **A single pipeline** builds once and promotes the same image to all five environments on every merge, or
- **One monorepo / one production** serves all five with one database and one URL (multi-tenant), and you still redeploy the single app for any template tweak.

**If each customer has their own deployment and their own pipeline (or manual promote per env),** updating Customer 3’s template only requires **deploying Customer 3’s** build—provided their branch or release only includes changes you want for them.

**If all five intentionally run the exact same artifact** (same Git SHA everywhere), then **any** template addition or fix shipped in that artifact is **available** in all five builds—but only **active** for a shop if you activate that `templateId` in that shop’s database. Unused templates sit in the bundle (larger build, more surface area). A **security-sensitive** point is that **every** template’s code is present in every such deployment; see *Governance* below.

### Problem B — Registry growth and community templates

[`TEMPLATE_REGISTRY`](../../src/templates/registry.ts) is a flat map: every template is **first-party** from the repository’s point of view. A **community-sourced** template ecosystem (people create and share templates) raises:

- **Trust and review** — templates are arbitrary React/code; they run in the same process as checkout and admin unless you isolate deployments.
- **Compatibility** — the `TemplateModule` contract evolves with the engine; community packs must **pin** engine versions or follow semver on `src/templates/types.ts`.
- **Bundle size and attack surface** — shipping dozens of optional templates in **one** binary increases JS/CSS and the set of code paths in production.

None of this is impossible; it is **process + architecture**, not a missing feature flag.

---

## Options (effort and when to use them)

Effort is **relative** (order-of-magnitude). Treat as planning guidance, not a quote.

### 1) Keep current model: separate deploy per customer (recommended baseline)

**Idea:** Five Git forks or five branches/releases, five databases, five hosts—per [FORK_DEPLOYMENT_ENGINE.md](../deployment/FORK_DEPLOYMENT_ENGINE.md). Each customer’s `registry.ts` only **needs** their template(s); you can **omit** other customers’ templates from **their** fork to keep bundles small.

| Aspect | Detail |
|--------|--------|
| **Isolates redeploys?** | Yes, if CI/CD promotes **per environment**, not “one image to all.” |
| **Effort** | **Low** (operational discipline). Engine already matches this model. |
| **Community templates** | Bring in as **copy-paste**, **submodule**, or **npm package** that only that fork depends on; each customer **opts in** by dependency + registry entry. |

**Limitation:** You maintain **N** codebases or **N** long-lived branches unless you automate “slice” builds (next option).

---

### 2) One monorepo, many “release slices” or build flavors

**Idea:** Single repo contains all five templates; build pipeline produces **customer-specific artifacts** (e.g. different `TEMPLATE_REGISTRY` or env `INCLUDE_TEMPLATES=id-a,id-b` via codegen). Only the chosen templates are compiled into that customer’s bundle.

| Aspect | Detail |
|--------|--------|
| **Isolates redeploys?** | Yes: Customer 3’s pipeline only builds/releases Customer 3’s slice. |
| **Effort** | **Medium** — CI, conventions, and guardrails so no customer build accidentally includes another’s proprietary template. |
| **Community templates** | Same as (1): opt-in per slice; optional **verified** packages. |

---

### 3) Templates as versioned packages (`@your-scope/template-acme`)

**Idea:** Extract each customer template (or shared themes) into **npm packages** consumed by the engine app. Redeploy a customer when their **package version** changes—not when unrelated engine commits land (if you don’t auto-bump everyone).

| Aspect | Detail |
|--------|--------|
| **Isolates redeploys?** | Operationally yes; still **one deploy per customer** when their package updates. |
| **Effort** | **Medium** — publish flow, semver, maybe private registry. |
| **Community templates** | Natural fit: **packages are the distribution unit**; engine version range in `peerDependencies`. |

---

### 4) True multi-tenant SaaS: one deployment, many shops, many template ids

**Idea:** One URL/app, tenant resolution (domain or path), **per-tenant** DB or row-level tenancy; each tenant activates their own `templateId`. All template modules for **all** tenants must still **exist inside that one build** unless you adopt (5) or (6).

| Aspect | Detail |
|--------|--------|
| **Isolates redeploys?** | **No** for template **code** — any new template still needs a **global** app deploy. You only avoid N hosts. |
| **Effort** | **High** — tenancy model, auth, data isolation, billing, and compliance; template story is the **easiest** part compared to multi-tenant data. |
| **Community templates** | **High risk** unless templates are audited: every tenant’s code ships to **every** tenant’s browser/runtime context depending on architecture. |

---

### 5) “Template service” / micro-frontend / Module Federation

**Idea:** Motor shell loads **remote** UI (iframe, federated JS bundle, or separate Next app on subdomain) so **template teams** deploy **their** front independently.

| Aspect | Detail |
|--------|--------|
| **Isolates redeploys?** | **Yes** for the remote UI; motor may still need updates for contract changes. |
| **Effort** | **High** — SSR alignment, auth cookies, SEO, performance, versioning, and operational complexity. Next.js + RSC makes **arbitrary remote React** especially delicate compared to a classic SPA shell. |

Use this when **independent teams** and **independent release cadence** for **full custom layouts** are worth the platform cost.

---

### 6) Narrow “template” to data + generic renderer (schema-driven themes)

**Idea:** Most differentiation is **tokens, blocks, and layout JSON**; the motor owns the React tree. Custom code drops or moves to **small** extension points.

| Aspect | Detail |
|--------|--------|
| **Hot-swap without redeploy?** | Often **yes** for content/theme JSON; **no** for arbitrary new React without a deploy or remote module story. |
| **Effort** | **Very high** to reach parity with today’s `TemplateModule` flexibility; long term it is the cleanest **marketplace** model if you constrain what a “template” may do. |

---

## Practical recommendation matrix

| Goal | Sensible first step |
|------|---------------------|
| Stop “one customer’s template work redeploying the others” | **Separate promote per customer** (option 1 or 2); do not use one shared “deploy all envs on main” job without filters. |
| Keep full React freedom per customer | Stay with **in-repo or package templates** + **per-customer builds** (1–3). |
| Many tenants, one app | Plan **multi-tenant data** first; accept **global** deploys for new template **code** unless you invest in (5) or (6). |
| Community “marketplace” | Prefer **versioned packages** (3) + **reviewed allow-list** in each customer’s registry or slice; avoid loading unaudited code into checkout-critical deploys without isolation. |

---

## Summary

- Today, **templates are code in the bundle**; **runtime** only selects `templateId`. Per-customer isolation of **deploy impact** is primarily a **deployment / CI** concern: **five customers ⇒ five independent promote paths**, each with only the templates that customer should run.
- **Crowdsourced templates** are viable as **packages** or **optional registry entries**, with **versioning and security review**; stuffing unlimited third-party React into **one** shared production binary without review is the riskiest path.
- A **separate template server** that removes the need to redeploy the motor **at all** implies **remote UI loading** or a **non-React / schema-only** template system—both are **large** architectural steps compared to **per-customer builds** and **template packages**.

If you later adopt a concrete direction (e.g. “npm packages only” vs “Module Federation”), add a short ADR under `docs/` and link it from this file.
