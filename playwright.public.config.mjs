import { defineConfig } from "@playwright/test";

const baseURL = process.env.VOC_PUBLIC_BASE_URL || "https://wiard.github.io/voc-frontend/";
if (!["https://wiard.github.io/voc-frontend/", "https://nieuw.vocpartij.nl/"].includes(baseURL)) {
  throw new Error(
    "Public tests allow only the GitHub Pages test URL or https://nieuw.vocpartij.nl/",
  );
}

export default defineConfig({
  testDir: "./tests",
  testMatch: ["homepage.spec.ts", "knowledge.spec.ts", "public-site.check.ts"],
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: "test-results/public",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/public" }]],
  use: {
    baseURL,
    channel: "chrome",
    ignoreHTTPSErrors: false,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "small-mobile", use: { viewport: { width: 320, height: 740 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
  ],
});
