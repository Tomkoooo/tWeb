/**
 * Server-side reservation TTL clamping (never trust client).
 * Stripe Checkout `expires_at` must be at least ~30 minutes in the future when set;
 * we align defaults so DB reservation and Stripe session stay in sync.
 */

const THIRTY_MIN_MS = 30 * 60 * 1000;
const DEFAULT_MIN_MS = THIRTY_MIN_MS;
const DEFAULT_MAX_MS = 60 * 60 * 1000;

export function parseEnvMs(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Effective hold duration in ms after clamping. */
export function clampReservationTtlMs(requestedTtlMs?: number | null): number {
  const minMs = parseEnvMs("RESERVATION_TTL_MIN_MS", DEFAULT_MIN_MS);
  const maxMs = Math.max(minMs, parseEnvMs("RESERVATION_TTL_MAX_MS", DEFAULT_MAX_MS));
  const requested = requestedTtlMs != null && requestedTtlMs > 0 ? requestedTtlMs : minMs;
  return Math.min(Math.max(requested, minMs), maxMs);
}

/** Seconds to subtract from DB reservation end so Stripe session expires first (safety). */
export function stripeSessionBufferSec(): number {
  const n = Number(process.env.RESERVATION_STRIPE_SESSION_BUFFER_SEC);
  return Number.isFinite(n) && n >= 0 && n < 3600 ? Math.floor(n) : 60;
}

export function reservationEndsAt(now: Date, ttlMs: number): Date {
  return new Date(now.getTime() + ttlMs);
}

/** Unix seconds for Stripe Checkout `expires_at` (Stripe requires >= 30 min when set). */
export function stripeCheckoutExpiresAtUnix(now: Date, reservationEndsAt: Date): number {
  const bufferMs = stripeSessionBufferSec() * 1000;
  const candidate = Math.floor((reservationEndsAt.getTime() - bufferMs) / 1000);
  const minStripe = Math.floor((now.getTime() + THIRTY_MIN_MS) / 1000);
  return Math.max(candidate, minStripe);
}
