import mongoose, { ClientSession } from "mongoose";
import Product from "@/models/Product";
import Reservation from "@/models/Reservation";
import { clampReservationTtlMs, reservationEndsAt } from "@/services/reservation-ttl";

export class InventoryReservationError extends Error {
  constructor(
    message: string,
    public readonly code: "INSUFFICIENT_STOCK" | "TRANSACTION_FAILED" = "INSUFFICIENT_STOCK"
  ) {
    super(message);
    this.name = "InventoryReservationError";
  }
}

export type CheckoutReserveItem = {
  product: string;
  variantId?: string;
  quantity: number;
};

function sessionOpt(session?: ClientSession | null): { session?: ClientSession } {
  return session ? { session } : {};
}

async function syncVariantAggregateStock(
  productId: mongoose.Types.ObjectId,
  session?: ClientSession | null
) {
  const q = Product.findById(productId);
  const p = session ? await q.session(session).lean() : await q.lean();
  if (!p || !Array.isArray((p as any).variants) || (p as any).variants.length === 0) return;
  const sum = (p as any).variants.reduce((s: number, v: any) => s + (v.stock || 0), 0);
  await Product.updateOne({ _id: productId }, { $set: { stock: sum } }, sessionOpt(session));
}

/**
 * Atomic single-line stock decrement. Optional Mongo session (omit on standalone / memory server).
 */
export async function decrementCheckoutLineStock(
  session: ClientSession | null | undefined,
  item: CheckoutReserveItem
): Promise<void> {
  const productId = new mongoose.Types.ObjectId(item.product);
  const qty = item.quantity;
  if (!Number.isFinite(qty) || qty < 1) {
    throw new InventoryReservationError("Érvénytelen mennyiség a foglaláshoz");
  }

  const q = Product.findById(productId);
  const product = session ? await q.session(session).lean() : await q.lean();
  if (!product) throw new InventoryReservationError("A termék nem található");
  if (!product.isActive || !product.isVisible) {
    throw new InventoryReservationError("A termék már nem elérhető");
  }

  const hasVariants = Array.isArray((product as any).variants) && (product as any).variants.length > 0;
  const requireVariantSelection = Boolean((product as any).requireVariantSelection) && hasVariants;

  if (item.variantId) {
    if (!hasVariants) throw new InventoryReservationError("Érvénytelen variáns");
    // Use native collection + modifiedCount: Mongoose Query wrappers have been observed to report
    // misleading results under concurrent arrayFilters updates; losers must not proceed to Reservation.create.
    const filter = { _id: productId, isActive: true, isVisible: true };
    const update = { $inc: { "variants.$[v].stock": -qty } };
    const opts = {
      ...sessionOpt(session),
      arrayFilters: [{ "v.id": item.variantId, "v.stock": { $gte: qty } }],
    };
    // Mongoose bundles mongodb types that diverge from top-level `mongodb`; avoid cross-package ClientSession friction.
    const res = await Product.collection.updateOne(filter, update, opts as Parameters<typeof Product.collection.updateOne>[2]);
    if (res.modifiedCount !== 1) {
      throw new InventoryReservationError("Nincs elég készlet a kiválasztott variánshoz", "INSUFFICIENT_STOCK");
    }
    await syncVariantAggregateStock(productId, session);
    return;
  }

  if (requireVariantSelection) {
    throw new InventoryReservationError("Válassz variánst a termékhez");
  }

  const updatedRoot = await Product.findOneAndUpdate(
    { _id: productId, isActive: true, isVisible: true, stock: { $gte: qty } },
    { $inc: { stock: -qty } },
    { ...sessionOpt(session), returnDocument: "after" }
  );
  if (!updatedRoot) {
    throw new InventoryReservationError("Nincs elég készlet", "INSUFFICIENT_STOCK");
  }

  if (hasVariants) {
    await syncVariantAggregateStock(productId, session);
  }
}

async function restoreLineStock(
  session: ClientSession | undefined | null,
  productId: mongoose.Types.ObjectId,
  variantId: string | undefined,
  qty: number
) {
  if (variantId) {
    await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { "variants.$[v].stock": qty } },
      { arrayFilters: [{ "v.id": variantId }], ...sessionOpt(session) }
    );
    await syncVariantAggregateStock(productId, session ?? null);
  } else {
    await Product.updateOne({ _id: productId }, { $inc: { stock: qty } }, sessionOpt(session));
  }
}

/** Undo a successful `decrementCheckoutLineStock` (e.g. multi-line COD rollback). */
export async function restoreCheckoutLineStock(item: CheckoutReserveItem): Promise<void> {
  const productId = new mongoose.Types.ObjectId(item.product);
  await restoreLineStock(undefined, productId, item.variantId, item.quantity);
}

type AppliedLine = {
  productId: mongoose.Types.ObjectId;
  variantId?: string;
  quantity: number;
  reservationId: mongoose.Types.ObjectId;
};

/**
 * Holds stock for all cart lines (all-or-nothing) using per-document atomic updates.
 * Works on standalone MongoDB (no multi-document transaction requirement).
 */
export async function allocateReservationsForStripeTempOrder(
  tempOrderId: mongoose.Types.ObjectId,
  items: CheckoutReserveItem[],
  options?: { serverNow?: Date; requestedTtlMs?: number | null }
): Promise<{ expiresAt: Date; ttlMs: number }> {
  const now = options?.serverNow ?? new Date();
  const ttlMs = clampReservationTtlMs(options?.requestedTtlMs ?? undefined);
  const expiresAt = reservationEndsAt(now, ttlMs);

  const applied: AppliedLine[] = [];

  try {
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        throw new InventoryReservationError("Érvénytelen termékazonosító");
      }
      const productId = new mongoose.Types.ObjectId(item.product);
      await decrementCheckoutLineStock(undefined, item);
      const [doc] = await Reservation.create([
        {
          tempOrder: tempOrderId,
          product: productId,
          variantId: item.variantId,
          quantity: item.quantity,
          state: "pending",
          expiresAt,
        },
      ]);
      applied.push({
        productId,
        variantId: item.variantId,
        quantity: item.quantity,
        reservationId: doc._id as mongoose.Types.ObjectId,
      });
    }
    return { expiresAt, ttlMs };
  } catch (e) {
    for (const a of applied.reverse()) {
      await restoreLineStock(undefined, a.productId, a.variantId, a.quantity);
      await Reservation.deleteOne({ _id: a.reservationId });
    }
    if (e instanceof InventoryReservationError) throw e;
    throw new InventoryReservationError(
      e instanceof Error ? e.message : "Foglalás sikertelen",
      "TRANSACTION_FAILED"
    );
  }
}

/**
 * Restores stock for reservations in the given states (default pending + confirmed for refund path).
 */
export async function releaseReservationsForTempOrder(
  tempOrderId: mongoose.Types.ObjectId | string,
  options?: { states?: Array<"pending" | "confirmed"> }
): Promise<number> {
  const states = options?.states ?? ["pending", "confirmed"];
  const tid = typeof tempOrderId === "string" ? new mongoose.Types.ObjectId(tempOrderId) : tempOrderId;

  const rows = await Reservation.find({ tempOrder: tid, state: { $in: states } }).lean();
  let count = 0;
  for (const r of rows) {
    await restoreLineStock(undefined, r.product as mongoose.Types.ObjectId, r.variantId, r.quantity);
    await Reservation.updateOne(
      { _id: r._id, state: { $in: states } },
      { $set: { state: "released" } }
    );
    count += 1;
  }
  return count;
}

export async function confirmPendingReservationsForTempOrder(tempOrderId: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(tempOrderId)) return;
  const tid = new mongoose.Types.ObjectId(tempOrderId);
  await Reservation.updateMany(
    { tempOrder: tid, state: "pending" },
    { $set: { state: "confirmed" } }
  );
}

export async function markReservationsExpiredForTempOrder(tempOrderId: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(tempOrderId)) return;
  const tid = new mongoose.Types.ObjectId(tempOrderId);
  await Reservation.updateMany(
    { tempOrder: tid, state: "pending" },
    { $set: { state: "expired" } }
  );
}

/** Sweeper: release pending reservations past expiresAt (idempotent per row). */
export async function sweepExpiredPendingReservations(now: Date = new Date()): Promise<number> {
  const expired = await Reservation.find({ state: "pending", expiresAt: { $lt: now } }).lean();
  let total = 0;
  for (const r of expired) {
    const updated = await Reservation.findOneAndUpdate(
      { _id: r._id, state: "pending" },
      { $set: { state: "released" } },
      { returnDocument: "after" }
    );
    if (!updated) continue;
    await restoreLineStock(undefined, r.product as mongoose.Types.ObjectId, r.variantId, r.quantity);
    total += 1;
  }
  return total;
}
