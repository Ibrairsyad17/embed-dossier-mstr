import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/tests/**",
        "src/**/*.test.{ts,tsx}",
        "src/index.ts",
        "src/exports.ts",
        "src/vitest.config.ts",
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 75,
        statements: 75,
      },
    },
  },
});
