import { afterEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

import "./test-env-vars";

afterEach(() => {
  vi.restoreAllMocks();
  /** Integration/concurrency keep Mongoose models registered on the shared connection. */
  if (!process.env.VITEST_INTEGRATION && !process.env.VITEST_CONCURRENCY) {
    vi.resetModules();
  }
});
