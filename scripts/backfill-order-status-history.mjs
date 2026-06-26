#!/usr/bin/env node
/**
 * One-time backfill for orders missing statusHistory.
 * Estimates a single transition from pending -> current status using statusChangedAt or updatedAt.
 *
 * Usage: node scripts/backfill-order-status-history.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const OrderSchema = new mongoose.Schema({}, { strict: false, collection: "orders" });
const Order = mongoose.models.BackfillOrder || mongoose.model("BackfillOrder", OrderSchema);

async function main() {
  await mongoose.connect(uri);
  const cursor = Order.find({
    $or: [{ statusHistory: { $exists: false } }, { statusHistory: { $size: 0 } }],
  })
    .select("_id status statusChangedAt updatedAt createdAt")
    .lean()
    .cursor();

  let updated = 0;
  for await (const order of cursor) {
    const changedAt = order.statusChangedAt || order.updatedAt || order.createdAt || new Date();
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          statusChangedAt: order.statusChangedAt || changedAt,
          statusHistory: [
            {
              from: "pending",
              to: String(order.status || "pending"),
              changedAt,
            },
          ],
        },
      }
    );
    updated += 1;
  }

  console.log(`Backfilled statusHistory on ${updated} order(s).`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
