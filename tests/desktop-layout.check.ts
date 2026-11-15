import { test, expect } from "@playwright/test";

test("hero blijft leesbaar en de desktopacties en Effectverkenner passen in het eerste scherm", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("#kennisbank-titel")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator("main > section").first();
  const measurements = await hero.evaluate((section) => {
    const title = section.querySelector("h1")!;
    const intro = title.nextElementSibling!;
    const actions = intro.nextElementSibling!;
    const model = section
      .querySelector<HTMLButtonElement>("button")!
      .closest(".rounded-\\[1\\.75rem\\]")!;
    const effectTitle = [...section.querySelectorAll("p")].find(
      (p) => p.textContent === "Effectverkenner",
    )!;
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right };
    };
    const lines = new Set<number>();
    const brokenWords: string[] = [];
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      for (const match of node.textContent!.matchAll(/\S+/g)) {
        const wordLines = new Set<number>();
        for (let offset = match.index; offset < match.index + match[0].length; offset++) {
          const range = document.createRange();
          range.setStart(node, offset);
          range.setEnd(node, offset + 1);
          const box = range.getBoundingClientRect();
          if (box.width) {
            lines.add(Math.round(box.top));
            wordLines.add(Math.round(box.top));
          }
        }
        if (wordLines.size > 1) brokenWords.push(match[0]);
      }
    }
    return {
      titleLines: lines.size,
      brokenWords,
      title: rect(title),
      intro: rect(intro),
      actions: [...actions.querySelectorAll("a")].map(rect),
      model: rect(model),
      effectTitle: rect(effectTitle),
      header: rect(document.querySelector("header")!),
      scrollWidth: document.documentElement.scrollWidth,
      viewport: { width: innerWidth, height: innerHeight },
    };
  });

  expect(measurements.titleLines).toBe(3);
  expect(measurements.brokenWords).toEqual([]);
  expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.viewport.width);
  expect(measurements.title.left).toBeGreaterThanOrEqual(0);
  expect(measurements.title.right).toBeLessThanOrEqual(measurements.viewport.width);
  if (measurements.viewport.width >= 1024) {
    expect(measurements.intro.bottom).toBeLessThan(measurements.viewport.height);
    for (const action of measurements.actions) {
      expect(action.bottom).toBeLessThan(measurements.viewport.height);
      expect(action.top).toBeGreaterThanOrEqual(measurements.header.bottom);
    }
    expect(measurements.effectTitle.top - measurements.header.bottom).toBeLessThanOrEqual(80);
    expect(measurements.model.bottom).toBeLessThan(measurements.viewport.height);
  }

  const primary = hero.getByRole("link", { name: "Ontdek onze methode" });
  await expect(primary).toHaveAttribute("href", "#werkwijze");
  await primary.scrollIntoViewIfNeeded();
  await expect(primary).toBeInViewport();
  for (const topic of ["Energie", "Mobiliteit", "Wonen"]) {
    const button = hero.getByRole("button", { name: topic, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  await expect(
    hero.getByText("Ontwerpdemonstratie met fictieve scores", { exact: false }),
  ).toBeVisible();
});
