import { test, expect, type Page } from "@playwright/test";

async function openHomepage(page: Page) {
  await page.goto("./");
  await expect(page.locator("#kennisbank-titel")).toBeVisible();
}

test("zelfstandig document zonder Figma-verzoeken", async ({ page }) => {
  const figmaRequests: string[] = [];
  page.on("request", (request) => {
    if (/figma\.(com|site)|\/\.figma\//i.test(request.url())) {
      figmaRequests.push(request.url());
    }
  });
  await openHomepage(page);
  await expect(page).toHaveTitle("VOC — Verenigd Onafhankelijk Collectief");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Politiek.");
  expect(await page.locator("html").innerHTML()).not.toContain("<!-- figma:");
  expect(figmaRequests).toEqual([]);
  expect((await page.request.get("./favicon.png")).status()).toBe(200);
});

test("geen consolefouten, ontbrekende imports of kapotte afbeeldingen", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) =>
    errors.push(`${request.url()}: ${request.failure()?.errorText}`),
  );
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
  });
  await openHomepage(page);
  await page.evaluate(() => document.fonts.ready);
  for (const image of await page.getByRole("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element: HTMLImageElement) => element.decode());
    await expect(image).toHaveAttribute("alt", /\S/);
    expect(
      await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    ).toBeGreaterThan(0);
  }
  expect(await page.evaluate(() => document.fonts.check('700 16px "Inter"'))).toBe(true);
  expect(errors).toEqual([]);
});

test("navigatie verwijst naar bestaande secties en mobiel menu sluit", async ({ page }) => {
  await openHomepage(page);
  const brokenAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href")!)
        .filter((href) => href !== "#" && !document.getElementById(href.slice(1))),
    );
  expect(brokenAnchors).toEqual([]);
  const mobile = page.getByRole("button", { name: "Menu openen", exact: true });
  if (await mobile.isVisible()) {
    await mobile.click();
    await expect(page.getByRole("button", { name: "Menu sluiten" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await page
      .getByRole("navigation", { name: "Mobiele hoofdnavigatie" })
      .getByRole("link", { name: "Beginselen" })
      .click();
    await expect(mobile).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("navigation", { name: "Mobiele hoofdnavigatie" })).toHaveCount(0);
  } else {
    await page
      .getByRole("navigation", { name: "Hoofdnavigatie", exact: true })
      .getByRole("link", { name: "Beginselen" })
      .click();
  }
  await expect(page).toHaveURL(/#beginselen$/);
});

test("effectverkenner wisselt uitsluitend herkenbare demogegevens", async ({ page }) => {
  await openHomepage(page);
  const explorer = page.locator("main > section").first();
  await expect(explorer.getByText("DEMO", { exact: true })).toBeVisible();
  await expect(explorer).not.toContainText("LIVE MODEL");
  await expect(explorer).not.toContainText("Vandaag bijgewerkt");
  await expect(explorer).toContainText("fictieve scores en percentages");
  for (const [name, score, delta] of [
    ["Wonen", "92", "+18%"],
    ["Energie", "78", "−12%"],
    ["Mobiliteit", "64", "+7%"],
  ]) {
    await explorer.getByRole("button", { name, exact: true }).click();
    await expect(explorer.getByRole("button", { name, exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(explorer).toContainText(new RegExp(`${score}\\s*/100`));
    await expect(explorer.getByText(delta, { exact: true })).toBeVisible();
  }
});

test("demoformulieren valideren, verzenden niets en bewaren niets", async ({ page }) => {
  await openHomepage(page);
  await page.waitForLoadState("networkidle");
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() !== "GET" ||
      ["fetch", "xhr"].includes(request.resourceType()) ||
      request.isNavigationRequest()
    ) {
      submissions.push(`${request.method()} ${request.url()}`);
    }
  });
  const idea = page.getByRole("form", { name: "Onderzoeksvraagdemonstratie" });
  await idea.getByRole("button", { name: "Dien je vraag in (demo)", exact: true }).click();
  await expect(idea.locator("textarea:invalid")).toHaveCount(1);
  await idea.getByLabel("Wat speelt er?").fill("Synthetische onderzoeksvraag voor lokale test.");
  await idea.getByLabel("Plaats of postcode").fill("0000 AA");
  await idea.getByRole("button", { name: "Dien je vraag in (demo)", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "geen onderzoeksvraag ingediend" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nog een onderwerp proberen" }).click();
  await expect(page.getByLabel("Wat speelt er?")).toHaveValue("");

  const newsletter = page.getByRole("form", { name: "Nieuwsbriefdemonstratie" });
  await newsletter.getByLabel("E-mailadres").fill("ongeldig");
  await newsletter.getByRole("button", { name: "Aanmelden (demo)", exact: true }).click();
  await expect(newsletter.locator("input:invalid")).toHaveCount(1);
  await newsletter.getByLabel("E-mailadres").fill("synthetisch@example.invalid");
  await newsletter.getByRole("button", { name: "Aanmelden (demo)", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Je bent niet aangemeld" }),
  ).toBeVisible();
  expect(submissions).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
      cookie: document.cookie,
    })),
  ).toEqual({ local: 0, session: 0, cookie: "" });
  await page.reload();
  await expect(page.getByRole("form", { name: "Nieuwsbriefdemonstratie" })).toBeVisible();
  await expect(
    page.locator('#meedenken [role="status"], #nieuwsbrief [role="status"]'),
  ).toHaveCount(0);
});

test("responsive opmaak en visuele controle", async ({ page }, testInfo) => {
  await openHomepage(page);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const headline = await page.getByRole("heading", { level: 1 }).boundingBox();
  expect(headline).not.toBeNull();
  expect(headline!.x).toBeGreaterThanOrEqual(0);
  expect(headline!.x + headline!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  const clippedHeadings = await page
    .locator("main h1, main h2, main h3, main h4")
    .evaluateAll((headings) =>
      headings.flatMap((heading) => {
        const range = document.createRange();
        range.selectNodeContents(heading);
        return Array.from(range.getClientRects())
          .filter((rect) => rect.left < -1 || rect.right > innerWidth + 1)
          .map(() => heading.textContent);
      }),
    );
  expect(clippedHeadings).toEqual([]);
  await expect(page.getByRole("button", { name: "Aanmelden (demo)", exact: true })).toBeVisible();
  await testInfo.attach("homepage", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("toetsenbord, inhoudslink en toegankelijke formulierlabels", async ({ page }) => {
  await openHomepage(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Direct naar inhoud" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  for (const label of ["Wat speelt er?", "Plaats of postcode", "E-mailadres"]) {
    await expect(page.getByLabel(label)).toHaveCount(1);
  }
  const menu = page.getByRole("button", { name: "Menu openen", exact: true });
  if (await menu.isVisible()) {
    await menu.focus();
    await page.keyboard.press("Enter");
    const link = page
      .getByRole("navigation", { name: "Mobiele hoofdnavigatie" })
      .getByRole("link", { name: "Werkwijze" });
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(/#werkwijze$/);
  }
});

test("voorkeur voor minder beweging wordt gerespecteerd", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openHomepage(page);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    "auto",
  );
  expect(
    await page
      .getByRole("button", { name: "Wonen", exact: true })
      .evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThanOrEqual(0.001);
});
