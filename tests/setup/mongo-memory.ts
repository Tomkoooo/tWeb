import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;
let connectPromise: Promise<void> | null = null;

function resetAppMongooseCache() {
  global.mongoose = { conn: null, promise: null };
  global.mongooseUri = undefined;
}

function isSafeTestDatabaseUri(uri: string): boolean {
  try {
    const parsed = new URL(uri);
    const pathDb = parsed.pathname.replace(/^\//, "").split("/")[0] || "";
    const dbName = pathDb || parsed.searchParams.get("authSource") || "";
    return /test/i.test(dbName) || /_test/i.test(uri);
  } catch {
    return /test/i.test(uri);
  }
}

/** Prefer TEST_DATABASE_URL when it points at a dedicated test database. */
export async function connectTestDatabaseFromEnv(): Promise<boolean> {
  const uri = process.env.TEST_DATABASE_URL?.trim();
  if (!uri) return false;
  if (!isSafeTestDatabaseUri(uri)) {
    throw new Error(
      "TEST_DATABASE_URL must use a database name containing 'test' (e.g. webshop_engine_test)"
    );
  }
  process.env.DATABASE_URL = uri;
  resetAppMongooseCache();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    return true;
  } catch {
    return false;
  }
}

async function connectInMemoryServer() {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  const uri = mongoServer.getUri();
  process.env.DATABASE_URL = uri;
  resetAppMongooseCache();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
}

export async function connectTestDatabase() {
  if (mongoose.connection.readyState === 1) {
    resetAppMongooseCache();
    return;
  }

  if (connectPromise) {
    await connectPromise;
    if (mongoose.connection.readyState === 1) {
      resetAppMongooseCache();
      return;
    }
    connectPromise = null;
  }

  connectPromise = (async () => {
    const connected = await connectTestDatabaseFromEnv();
    if (connected) {
      resetAppMongooseCache();
      return;
    }
    await connectInMemoryServer();
  })();

  try {
    await connectPromise;
  } catch (e) {
    connectPromise = null;
    throw e;
  }
}

/** Wait for an open connection (heavy concurrent tests can briefly disconnect the memory server). */
export async function ensureTestDatabaseReady() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      const onConnected = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        mongoose.connection.off("connected", onConnected);
        mongoose.connection.off("error", onError);
      };
      mongoose.connection.once("connected", onConnected);
      mongoose.connection.once("error", onError);
    });
    return;
  }
  if (mongoServer) {
    await connectInMemoryServer();
    return;
  }
  await connectTestDatabase();
}

export async function clearTestDatabase() {
  await ensureTestDatabaseReady();
  const collections = mongoose.connection.collections;
  const jobs = Object.values(collections).map((collection) => collection.deleteMany({}));
  await Promise.all(jobs);
}

export async function disconnectTestDatabase() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
  connectPromise = null;
}
