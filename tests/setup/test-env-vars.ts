/** Shared env defaults for Vitest (no hooks — safe for concurrency/integration). */

const defaultTestUri = "mongodb://127.0.0.1:27017/krausz_webshop_test";
process.env.DATABASE_URL = process.env.DATABASE_URL || defaultTestUri;
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

function assertTestSafeDatabaseUri(uri: string) {
  try {
    const parsed = new URL(uri);
    const pathDb = parsed.pathname.replace(/^\//, "").split("/")[0] || "";
    const dbName = pathDb || parsed.searchParams.get("authSource") || "";
    if (!/test/i.test(dbName) && !/test/i.test(uri)) {
      throw new Error(
        `Refusing to run tests against non-test database "${dbName || uri}". Use a DB name containing "test" or unset TEST_DATABASE_URL to use mongodb-memory-server.`
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Refusing")) throw e;
    if (!/test/i.test(uri)) {
      throw new Error(`Refusing to run tests: database URL must contain "test": ${uri}`);
    }
  }
}

if (process.env.TEST_DATABASE_URL?.trim()) {
  assertTestSafeDatabaseUri(process.env.TEST_DATABASE_URL.trim());
}
