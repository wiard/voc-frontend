import { test, expect } from "@playwright/test";
import catalog from "../knowledge/generated/catalog.json" with { type: "json" };

test("publiek HTTPS-adres en alle 54 datasets werken", async ({ page, request }) => {
  test.setTimeout(120_000);
  const response = await page.goto("./");
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).origin).toBe("https://wiard.github.io");
  const security = await response!.securityDetails();
  expect(security?.validTo).toBeGreaterThan(Date.now() / 1000);
  await expect(page.locator("#kennisbank-titel")).toBeVisible();
  const data = await request.get("data/statistieken.json");
  expect(data.status()).toBe(200);
  const datasets = (await data.json()).datasets;
  expect(Object.keys(datasets)).toHaveLength(54);
  for (const [id, dataset] of Object.entries(datasets)) {
    await page.getByLabel("Kies een dataset", { exact: true }).selectOption(id);
    const view = page.locator(`[data-dataset-id="${id}"]`);
    await expect(view).toContainText((dataset as { titel: string }).titel);
  }
});

test("dossiers en middelen gebruiken geen productiehost voor eigen functies", async ({ page }) => {
  for (const path of ["./", ...catalog.documents.map((document) => document.path)]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const productionLinks = await page
      .locator("a[href], img[src], script[src], link[href]")
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          const value = element.getAttribute("href") || element.getAttribute("src");
          if (!value) return [];
          const url = new URL(value, location.href);
          return ["vocpartij.nl", "www.vocpartij.nl"].includes(url.hostname) ? [url.href] : [];
        }),
      );
    expect(productionLinks, path).toEqual([]);
  }
});

test("ontwikkelbestanden zijn niet als websitebestand gepubliceerd", async ({ request }) => {
  for (const path of [
    "src/App.tsx",
    "package.json",
    ".env",
    ".git/config",
    "docs/PHASE2D_REPORT.md",
    "knowledge/manifest.json",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBeGreaterThanOrEqual(400);
  }
});
