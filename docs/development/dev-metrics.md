# Dev Metrics Logger

The local metrics logger records page loading speed, Web Vitals, client fetch timings, API timings, server data phases, and Mongo connection timing while you test the app.

It is disabled by default. Enable it explicitly:

```bash
DEV_METRICS=1 npm run dev
```

For a local production build run:

```bash
DEV_METRICS=1 npm run build
DEV_METRICS=1 npm start
```

Metrics are written to:

```text
.next/dev-metrics/metrics.jsonl
```

To keep before/after runs separate, point a run at a different JSONL file:

```bash
DEV_METRICS=1 DEV_METRICS_FILE=.next/dev-metrics/metrics-after-fixes.jsonl npm start
```

The logger stores timing metadata only. It does not store request bodies, response bodies, cookies, or authorization headers, and it redacts sensitive query parameters.

After browsing pages and trying checkout/cart/profile flows, analyze the run:

```bash
npm run metrics:analyze
```

You can also analyze a specific file:

```bash
npm run metrics:analyze -- .next/dev-metrics/metrics.jsonl
```

Useful signals in the report:

- Slow `page-data` groups usually point to server rendering, cache misses, Mongo queries, or template/footer data loading.
- Slow `api` groups identify route handlers that took a long time or returned errors.
- Slow `client-fetch` groups show what the browser experienced for API calls.
- `db.cold-connect` spikes explain first-request latency.
- Poor `web-vital` values such as LCP, INP, CLS, FCP, and TTFB point to user-visible loading and interaction issues.
- `main-thread.long-task` entries point to hydration, rendering, or synchronous client work that can block interactions.
