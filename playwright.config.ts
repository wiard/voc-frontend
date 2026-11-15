import { defineConfig } from "@playwright/test";

const baseURL = `http://127.0.0.1:4173${process.env.VOC_BASE_PATH || "/"}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    channel: process.env.CI ? undefined : "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "small-mobile", use: { viewport: { width: 320, height: 740 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: {
    command:
      process.env.PLAYWRIGHT_USE_EXISTING_BUILD === "1"
        ? "pnpm preview"
        : "pnpm build && pnpm preview",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
