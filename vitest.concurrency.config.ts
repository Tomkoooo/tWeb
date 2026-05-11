import "dotenv/config";
import path from "path";
import { defineConfig } from "vitest/config";

/** Local / optional CI job: inventory race tests (Mongo memory server). Not part of default `vitest.config.ts` runs. */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["tests/setup/test-env.ts"],
    include: ["tests/concurrency/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
