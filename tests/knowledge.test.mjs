import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import vm from "node:vm";
import { parse } from "parse5";
import { bereken } from "../src/knowledge/tax-engine.js";
import { checkDist } from "../scripts/publication-checks.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const json = (path) => JSON.parse(read(path));
const manifest = json("knowledge/manifest.json");
const catalog = json("knowledge/generated/catalog.json");
const stats = json("knowledge/original/data/statistieken.json");
const defaults = json("knowledge/original/data/laboratorium.json");
const original = read("knowledge/original/js/laboratorium.js").toString();
const sandbox = { module: { exports: {} } };
vm.runInNewContext(original, sandbox, { timeout: 1000 });
const originalCalculate = sandbox.module.exports.bereken;
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const allNodes = (node) => [node, ...(node.childNodes || []).flatMap(allNodes)];
const attr = (node, key) => node.attrs?.find((item) => item.name === key)?.value;

test("all 25 original public files retain their original SHA-256 and published copies", () => {
  assert.equal(manifest.files.length, 25);
  for (const file of manifest.files) {
    assert.equal(sha(read(`knowledge/original/${file.path}`)), file.sha256);
    assert.equal(
      sha(read(`public/${file.path === "index.html" ? "over-voc.html" : file.path}`)),
      file.sha256,
    );
  }
});

test("catalog preserves 11 complete dossiers, metadata, 54 datasets and three proposals", () => {
  assert.equal(catalog.documents.length, 11);
  assert.equal(Object.keys(stats.datasets).length, 54);
  assert.equal(json("knowledge/original/data/voorstellen.json").voorstellen.length, 3);
  for (const document of catalog.documents) {
    assert.ok(document.text.includes(document.title));
    assert.equal(document.publishedAt, null); // No publication dates invented.
    assert.ok(document.headings.length);
    assert.ok(document.anchors.includes("inhoud"));
  }
  assert.ok(catalog.documents.find((d) => d.id === "geschiedenis").text.includes("Spinoza"));
  assert.ok(
    catalog.documents
      .find((d) => d.id === "mensen")
      .text.includes("Seculiere democratische rechtsstaat"),
  );
});

test("all source-file references and dataset provenance remain truthful and complete", () => {
  const files = new Set(Object.values(stats.datasets).flatMap((d) => d.bronbestanden || []));
  assert.equal(files.size, 49);
  assert.deepEqual(catalog.registeredSourceFiles.map((f) => f.path).sort(), [...files].sort());
  assert.equal(catalog.sources.length, 125);
  assert.equal(new Set(catalog.sources.map((s) => s.url)).size, catalog.sources.length);
  assert.equal(catalog.provenance.rawArchiveIncluded, false);
  for (const file of catalog.registeredSourceFiles)
    assert.equal(file.availableInPublicSnapshot, false);
  for (const [id, dataset] of Object.entries(stats.datasets)) {
    assert.ok(catalog.sources.some((s) => s.url === dataset.bron.url && s.datasetIds.includes(id)));
    for (const series of dataset.reeksen)
      assert.equal(series.waarden.length, dataset.labels.length);
  }
});

test("every original internal link, fragment, script and stylesheet has a preserved destination", () => {
  for (const document of catalog.documents) {
    const nodes = allNodes(parse(read(`public/${document.path}`).toString()));
    for (const node of nodes) {
      for (const attribute of ["href", "src"]) {
        const value = attr(node, attribute);
        if (!value || /^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
        const url = new URL(value, `https://voc.invalid/${document.path}`);
        const path = decodeURIComponent(url.pathname.slice(1));
        if (path !== "index.html")
          assert.doesNotThrow(() => read(`public/${path}`), `${document.path}: missing ${path}`);
        if (!url.hash) continue;
        const fragment = decodeURIComponent(url.hash.slice(1));
        if (path === "index.html")
          assert.ok(fragment === "inhoud" || catalog.homeCompatibilityAnchors.includes(fragment));
        else
          assert.ok(
            catalog.documents.find((d) => d.path === path)?.anchors.includes(fragment),
            `${document.path}: missing #${fragment}`,
          );
      }
    }
  }
});

test("React tax engine contains the original pure functions verbatim", () => {
  const start = original.indexOf("  function eenheden("),
    end = original.indexOf("  if (typeof module", start);
  const generated = read("src/knowledge/tax-engine.js").toString();
  assert.ok(generated.includes(original.slice(start, end)));
  assert.ok(!generated.includes("document"));
});

function reference(income, scenario) {
  const gross = BigInt(Math.round(income * 100));
  const foot = BigInt(Math.round(scenario.voet * 100));
  const taxable = gross > foot ? gross - foot : 0n;
  let lower = 0n,
    total = 0n;
  for (let i = 0; i < scenario.tarieven.length; i++) {
    const upper =
      i < scenario.grenzen.length ? BigInt(Math.round(scenario.grenzen[i] * 100)) : taxable;
    const portion = (taxable < upper ? taxable : upper) - lower;
    if (portion > 0n) total += portion * BigInt(Math.round(scenario.tarieven[i] * 100));
    lower = upper;
  }
  const tax = (total + 5000n) / 10000n;
  return {
    bruto: Number(gross) / 100,
    grondslag: Number(taxable) / 100,
    belasting: Number(tax) / 100,
    netto: Number(gross - tax) / 100,
  };
}

test("fixed default outcomes and half-cent rounding retain their documented meaning", () => {
  assert.deepEqual(
    defaults.inkomens.map((income) => bereken(income, defaults.scenario1).netto),
    [19200, 35700, 61000],
  );
  assert.deepEqual(
    defaults.inkomens.map((income) => bereken(income, defaults.scenario2).netto),
    [20500, 38500, 64000],
  );
  assert.equal(bereken(0.01, { voet: 0, grenzen: [], tarieven: [50] }).belasting, 0.01);
  assert.equal(bereken(0.03, { voet: 0, grenzen: [], tarieven: [50] }).belasting, 0.02);
});

test("1000 deterministic synthetic scenarios match both original and independent integer arithmetic", () => {
  let seed = 20261115;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let i = 0; i < 1000; i++) {
    const count = 1 + random(4);
    const scenario = {
      voet: random(10000000) / 100,
      tarieven: Array.from({ length: count }, () => random(10001) / 100),
      grenzen: [],
    };
    for (let j = 0; j < count - 1; j++)
      scenario.grenzen.push((scenario.grenzen[j - 1] || 0) + 1 + random(100000) / 100);
    const income = random(1000000001) / 100;
    assert.deepEqual(
      bereken(income, scenario),
      JSON.parse(JSON.stringify(originalCalculate(income, scenario))),
    );
    assert.deepEqual(bereken(income, scenario), reference(income, scenario));
  }
});

test("boundaries, zero, allowance and maximum income match the original", () => {
  for (const scenario of [
    defaults.scenario1,
    defaults.scenario2,
    { voet: 20000, grenzen: [10000, 40000, 90000], tarieven: [0, 18.37, 52.19, 100] },
  ]) {
    for (const income of [
      0,
      0.01,
      scenario.voet,
      10000000,
      ...scenario.grenzen.flatMap((b) => [
        scenario.voet + b - 0.01,
        scenario.voet + b,
        scenario.voet + b + 0.01,
      ]),
    ]) {
      assert.deepEqual(bereken(income, scenario), reference(income, scenario));
      assert.deepEqual(
        bereken(income, scenario),
        JSON.parse(JSON.stringify(originalCalculate(income, scenario))),
      );
    }
  }
});

test("invalid inputs are rejected by both original and integrated model", () => {
  const valid = defaults.scenario1;
  const inputs = [
    [-1, valid],
    [NaN, valid],
    [Infinity, valid],
    ["24000", valid],
    [0.001, valid],
    [1, null],
    [1, { voet: 0, grenzen: [], tarieven: [] }],
    [1, { voet: 0, grenzen: [], tarieven: [101] }],
    [1, { voet: -1, grenzen: [], tarieven: [20] }],
    [1, { voet: 0, grenzen: [200, 100], tarieven: [20, 30, 40] }],
    [1, { voet: 0, grenzen: [0], tarieven: [20, 30] }],
    [10000000.01, valid],
  ];
  for (const [income, scenario] of inputs) {
    assert.throws(() => bereken(income, scenario));
    assert.throws(() => originalCalculate(income, scenario));
  }
});

test("publication rejects removal or replacement of an existing public dossier", () => {
  const root = mkdtempSync(join(tmpdir(), "voc-preservation-"));
  try {
    mkdirSync(join(root, "assets"));
    writeFileSync(
      join(root, "index.html"),
      '<script src="/assets/app.js"></script><link href="/assets/app.css">',
    );
    for (const path of ["favicon.png", "assets/app.js", "assets/app.css"])
      writeFileSync(join(root, path), "");
    const content = "Original public dossier";
    const options = { knowledgeManifest: [{ path: "feiten.html", sha256: sha(content) }] };
    assert.throws(() => checkDist(root, "/", options), /Existing public URL missing/);
    writeFileSync(join(root, "feiten.html"), content);
    assert.equal(checkDist(root, "/", options).length, 5);
    writeFileSync(join(root, "feiten.html"), "Incomplete replacement");
    assert.throws(() => checkDist(root, "/", options), /Existing public content changed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
