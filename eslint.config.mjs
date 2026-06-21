import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const FORBIDDEN_TEMPLATE_IMPORTS = {
  paths: [
    {
      name: "@/lib/db",
      message: "Templates must not connect to the database directly. Receive data via render props from the route shell.",
      allowTypeImports: true,
    },
    {
      name: "@/lib/mongodb",
      message: "Templates must not connect to MongoDB directly.",
      allowTypeImports: true,
    },
    {
      name: "@/lib/admin-auth",
      message: "Templates must not perform authorization. Admin checks belong in route handlers and server actions.",
      allowTypeImports: true,
    },
  ],
  patterns: [
    {
      group: ["@/services/*"],
      message: "Templates must not import from services at runtime. Type-only imports are allowed.",
      allowTypeImports: true,
    },
    {
      group: ["@/models/*"],
      message: "Templates must not import Mongoose models. Type-only imports are allowed.",
      allowTypeImports: true,
    },
    {
      group: ["@/actions/*"],
      message: "Templates must not import server actions. Mutations live in admin route handlers.",
    },
    {
      group: ["@/app/api/*"],
      message: "Templates must not import API route handlers.",
    },
  ],
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "landing-templates/**",
    "landing-templetes/**",
  ]),
  {
    files: ["src/templates/**/*.{ts,tsx}"],
    ignores: [
      // Re-export façades intentionally bridge the old feature folder.
      "src/templates/_shared/**",
    ],
    rules: {
      "no-restricted-imports": ["error", FORBIDDEN_TEMPLATE_IMPORTS],
    },
  },
]);

export default eslintConfig;
