import path from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          // pretendToBeVisual gives jsdom requestAnimationFrame — motion
          // (springs) and Base UI both schedule work on it.
          environmentOptions: {
            jsdom: { pretendToBeVisual: true },
          },
          include: ["registry/**/*.test.{ts,tsx}"],
          exclude: ["**/*.browser.test.*", "**/node_modules/**"],
          setupFiles: ["./test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["registry/**/*.browser.test.{ts,tsx}"],
          setupFiles: ["./test/browser-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
