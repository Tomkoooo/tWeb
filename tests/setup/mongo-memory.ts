import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export async function connectTestDatabase() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.DATABASE_URL = uri;
  await mongoose.connect(uri);
}

export async function clearTestDatabase() {
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
}
