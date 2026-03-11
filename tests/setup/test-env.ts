import { afterEach, vi } from "vitest";

process.env.DATABASE_URL = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/krausz_webshop_test";
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});
