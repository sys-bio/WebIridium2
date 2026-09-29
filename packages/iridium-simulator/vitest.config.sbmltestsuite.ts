import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/iridium-simulator/src/__tests__/sbmlTestSuite/**/*.test.{ts,js}",
    ],
  },
});
