import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import catalog from "../knowledge/generated/catalog.json" with { type: "json" };
import manifest from "../knowledge/manifest.json" with { type: "json" };

async function home(page: Page) {
  await page.goto("./");
  await expect(page.locator("#kennisbank-titel")).toBeVisible();
}

test("zeven onderdelen openen de kennis zonder de Figma-beginselen te vervangen", async ({
  page,
}) => {
  await home(page);
  const nav = page.getByRole("navigation", { name: "Zeven onderdelen van VOC" });
  await expect(nav.getByRole("link")).toHaveCount(7);
  await nav.getByRole("link", { name: "Historische dossiers", exact: true }).click();
  await expect(page).toHaveURL(/#historische-dossiers$/);
  await expect(
    page.getByRole("heading", { name: "Vrijheid van het individu", exact: true }),
  ).toHaveCount(1);
  await expect(page.locator('#beginselen a[href*="mensen.html#de-mens"]')).toHaveCount(1);
  await expect(page.locator("#ai-experiment")).toContainText("geen externe AI-API");
});

test("datasets tonen bron, eenheid, oorspronkelijke nulls en berekende status", async ({
  page,
}) => {
  await home(page);
  const view = page.locator('[data-dataset-id="bbp"]');
  await expect(view).toContainText("mld euro");
  await expect(
    view
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "1995", exact: true }) }),
  ).toContainText("330,0");
  await expect(view.getByRole("link", { name: /CBS StatLine/ })).toHaveAttribute(
    "href",
    /85865NED/,
  );
  await page.getByLabel("Kies een dataset", { exact: true }).selectOption("leerlingen_funderend");
  await expect(page.locator('[data-dataset-id="leerlingen_funderend"]')).toContainText(
    "— (ontbreekt)",
  );
  await page
    .getByLabel("Kies een dataset", { exact: true })
    .selectOption("inkomsten_uitgaven_reeel");
  await expect(page.locator('[data-dataset-id="inkomsten_uitgaven_reeel"]')).toContainText(
    "VOC-berekening",
  );
  await expect(page.locator('[data-dataset-id="inkomsten_uitgaven_reeel"]')).toContainText(
    "prijsindex",
  );
  await page.getByLabel("Kies een dataset", { exact: true }).selectOption("staatsschuld_rijk");
  await expect(page.locator('[data-dataset-id="staatsschuld_rijk"]')).toContainText(
    "Geen cijferreeks beschikbaar",
  );
  await page.getByLabel("Zoek datasets", { exact: true }).fill("nietbestaandedataset");
  await expect(page.getByLabel("Kies een dataset", { exact: true })).toBeDisabled();
});

test("historische inhoud, voorstellen en bronnen zijn vindbaar met hun juiste status", async ({
  page,
}) => {
  await home(page);
  await page.getByLabel("Zoek dossiers en geschiedenis").fill("Spinoza");
  await expect(
    page.getByRole("link", { name: "Nederland door de jaren heen", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Zoek bronnen", { exact: true }).fill("statline");
  await expect(page.locator('#bronregister a[target="_blank"]').first()).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  await expect(page.locator("#bronregister")).toContainText("49 unieke ruwe bronbestanden");
  await expect(page.locator("#bronregister")).toContainText("ontbreken in deze publieke export");
  await expect(page.locator("#voorstellen details")).toHaveCount(3);
  await page.locator("#voorstellen summary").first().click();
  await expect(page.locator("#voorstellen")).toContainText("Geen VOC-standpunten");
  await expect(page.locator("#voorstellen")).toContainText(
    "Geen doorrekening van dit voorstel beschikbaar",
  );
});

test("React-belastinglab rekent correct, verbergt verouderde uitkomsten en valideert grenzen", async ({
  page,
}) => {
  await home(page);
  const form = page.getByRole("form", { name: "Belastinglaboratorium", exact: true });
  const firstRow = () => form.locator("tbody tr").first();
  await expect(firstRow()).toContainText("19.200,00");
  await expect(firstRow()).toContainText("20.500,00");
  await form.getByLabel("Bruto inkomen 1", { exact: true }).fill("30000");
  await expect(form.locator("table")).toHaveCount(0);
  await form.getByRole("button", { name: "Bereken en vergelijk", exact: true }).click();
  await expect(firstRow()).toContainText("24.000,00");
  await expect(firstRow()).toContainText("25.000,00");
  const reactCells = await firstRow().locator("th, td").allTextContents();
  await form.getByLabel("Grens schijf 2 (€ grondslag) — scenario 1", { exact: true }).fill("20000");
  await form.getByRole("button", { name: "Bereken en vergelijk", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("strikt oplopen");
  await expect(form.locator("table")).toHaveCount(0);
  await form.getByRole("button", { name: "Herstel oefenwaarden", exact: true }).click();
  await expect(firstRow()).toContainText("19.200,00");

  await form.getByLabel("Aantal schijven — scenario 1", { exact: true }).selectOption("1");
  await expect(form.locator('input[name^="s1-rate-"]')).toHaveCount(1);
  await form.getByRole("button", { name: "Bereken en vergelijk", exact: true }).click();
  await expect(firstRow()).toContainText("19.200,00");
  await form.getByLabel("Aantal schijven — scenario 1", { exact: true }).selectOption("4");
  await expect(form.locator('input[name^="s1-rate-"]')).toHaveCount(4);
  await form.getByRole("button", { name: "Bereken en vergelijk", exact: true }).click();
  await expect(form.locator("table")).toHaveCount(1);

  // Compare the rendered React result with the unchanged legacy browser UI.
  await page.goto("laboratorium.html#doorrekening");
  await expect(page.locator("#rekenbediening")).toBeVisible();
  await page.locator("#inkomen-0").fill("30000");
  await page.locator('#belasting-form button[type="submit"]').click();
  const originalCells = await page
    .locator("#belasting-tabel tbody tr")
    .first()
    .locator("th, td")
    .allTextContents();
  expect(reactCells).toEqual(originalCells);
});

test("alle bestaande dossier-URLs en oude homepage-ankers blijven werken zonder consolefouten", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
  });
  for (const document of catalog.documents) {
    await page.goto(document.path);
    await expect(
      page.getByRole("heading", { level: 1, name: document.title, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => globalThis.document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  await home(page);
  await expect(page).toHaveTitle("VOC — Verenigd Onafhankelijk Collectief");
  for (const anchor of catalog.homeCompatibilityAnchors) {
    await page.goto(`index.html#${anchor}`);
    await expect(page).toHaveURL(new RegExp(`over-voc\\.html#${anchor}$`));
    await expect(page.locator(`[id="${anchor}"]`)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("alle oorspronkelijke publieke middelen zijn via HTTP bytegetrouw bereikbaar", async ({
  request,
}) => {
  for (const file of manifest.files) {
    const response = await request.get(file.path === "index.html" ? "over-voc.html" : file.path);
    expect(response.status(), file.path).toBe(200);
    expect(
      createHash("sha256")
        .update(await response.body())
        .digest("hex"),
      file.path,
    ).toBe(file.sha256);
  }
  const catalogResponse = await request.get("data/knowledge-catalog.json");
  expect(catalogResponse.status()).toBe(200);
  expect((await catalogResponse.json()).documents).toHaveLength(11);
});

test("kennisbank en rekenmodel veroorzaken geen opslag of externe AI-/formulierverzoeken", async ({
  page,
}) => {
  await home(page);
  await page.waitForLoadState("networkidle");
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET" || ["fetch", "xhr"].includes(request.resourceType()))
      writes.push(request.url());
  });
  await page.getByLabel("Zoek dossiers en geschiedenis").fill("onderwijs");
  await page.getByLabel("Zoek bronnen", { exact: true }).fill("canon");
  await page.getByLabel("Bruto inkomen 1", { exact: true }).fill("12345.67");
  await page.getByRole("button", { name: "Bereken en vergelijk", exact: true }).click();
  await expect(page.getByRole("region", { name: "Uitkomsten belastingmodel" })).toBeVisible();
  expect(writes).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
      cookie: document.cookie,
    })),
  ).toEqual({ local: 0, session: 0, cookie: "" });
});
