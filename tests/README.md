# Tests

## CI vs local

| Suite | CI (`docker-publish`) | Local |
| --- | --- | --- |
| `npm run test:unit` | Yes | Yes |
| `npm run test:integration` | No | Yes (`mongodb-memory-server` or `TEST_DATABASE_URL`) |
| `npm run test:concurrency` | **No** | Yes (in-memory Mongo only) |
| `npm run test:concurrency:stripe` | **No** | Optional (live Stripe test key) |
| `npm run test:predeploy` | **No** | Recommended before deploy |

CI has no dev server, production Mongo, or Stripe webhook CLI — do not wire integration/concurrency into the pipeline.

## Database

Integration and concurrency tests use MongoDB via `tests/setup/mongo-memory.ts`:

- Set **`TEST_DATABASE_URL`** to a dedicated database (name must contain `test`, e.g. `mongodb://127.0.0.1:27017/webshop_engine_test`) to run against a real local instance.
- If unset, tests fall back to **mongodb-memory-server** (no external Mongo required).
- If `TEST_DATABASE_URL` is set, its database name **must** contain `test` — the setup refuses production-like names.

`DATABASE_URL` for dev/prod is only overwritten when `TEST_DATABASE_URL` is set during tests, or when the in-memory server starts (concurrency/integration connect helpers).

## Focused suites

```bash
npm run test:numbered          # numbered variants: integration + race
npm run test:integration       # checkout + cart + numbered inventory
npm run test:concurrency       # inventory / variant last-unit races (serial, one worker)
npm run test:predeploy         # integration + concurrency (recommended before deploy)
```

## Concurrency / race tests

- Location: `tests/concurrency/`
- Config: `vitest.concurrency.config.ts` (excluded from default `npm test` / Docker unit job)
- **Serial execution** (`maxWorkers: 1`, `fileParallelism: false`) — files share one in-memory Mongo; parallel files caused flaky clears and false failures.
- Asserts **atomic** `$inc` stock decrements via `allocateReservationsForStripeTempOrder` (same path as Stripe checkout).
- Optional **Stripe live** race: `npm run test:concurrency:stripe` with `RUN_STRIPE_RACE_TESTS=1` and `STRIPE_SECRET_KEY` in `.env` (local only).

## Production inventory behavior

| Concern | Implementation |
| --- | --- |
| Last unit oversell | `decrementCheckoutLineStock` uses conditional `updateOne` / `findOneAndUpdate` with `stock: { $gte: qty }` |
| Multi-line carts | All-or-nothing allocate + rollback on any failure |
| Numbered issues | Per `variantId` (`num-42`) — same atomic variant path |
| Limited price quota | `claimedCount` + `limitQuantity` in filter |
| Expired holds | `sweepExpiredPendingReservations` + `POST /api/internal/reservations/sweep` (Bearer `CRON_SECRET`) |
| Stripe checkout conflict | `409` when `InventoryReservationError` code is `INSUFFICIENT_STOCK` |
| Webhook replay | Unique index on `StripeWebhookEvent.stripeEventId` |

**Deploy checklist (local):** run `npm run test:predeploy` on your machine, then configure `CRON_SECRET` and schedule `POST /api/internal/reservations/sweep` in production. Production uses per-document atomic Mongo updates (no multi-doc transactions required).
