import base from "./playwright.config.ts";

const sizes = [
  [375, 667],
  [375, 812],
  [768, 800],
  [768, 1024],
  [1024, 768],
  [1024, 900],
  [1280, 720],
  [1280, 900],
  [1440, 800],
  [1440, 1000],
  [1920, 900],
  [1920, 1080],
];

export default {
  ...base,
  testMatch: "desktop-layout.check.ts",
  outputDir: "test-results/responsive",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/responsive" }]],
  use: { ...base.use, reducedMotion: "reduce" },
  projects: sizes.map(([width, height]) => ({
    name: `${width}x${height}`,
    use: { viewport: { width, height } },
  })),
};
