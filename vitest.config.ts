import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "vitest-coverage",
      include: ["lib/**/*.ts", "pages/api/**/*.ts"],
      exclude: ["lib/lint-fixtures.ts", "lib/db-clone.ts", "test/**", "pages/api/auth/**"]
    }
  }
});
