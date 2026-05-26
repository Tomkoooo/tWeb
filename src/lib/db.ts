import mongoose from "mongoose";
import { isDevMetricsEnabled, recordDevMetric } from "@/lib/dev-metrics";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error("Please define the DATABASE_URL environment variable inside .env");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) {
    if (isDevMetricsEnabled()) {
      void recordDevMetric({
        source: "server",
        category: "db",
        name: "connection-reuse",
        value: 0,
        unit: "ms",
        status: "ok",
      });
    }
    return cached!.conn;
  }

  const metricName = cached!.promise ? "await-pending-connect" : "cold-connect";
  const start = performance.now();

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    if (isDevMetricsEnabled()) {
      await recordDevMetric({
        source: "server",
        category: "db",
        name: metricName,
        value: performance.now() - start,
        unit: "ms",
        status: "ok",
      });
    }
  } catch (e) {
    cached!.promise = null;
    if (isDevMetricsEnabled()) {
      await recordDevMetric({
        source: "server",
        category: "db",
        name: metricName,
        value: performance.now() - start,
        unit: "ms",
        status: "error",
        metadata: { errorName: e instanceof Error ? e.name : typeof e },
      });
    }
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
