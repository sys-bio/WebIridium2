import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../src"),
    },
  },
  test: {
    environment: "node",
    benchmark: {
      include: ["packages/iridium-simulator/**/*.bench.ts"],
    },
    include: ["packages/iridium-simulator/**/*.test.{ts,js}"],
  },
});
