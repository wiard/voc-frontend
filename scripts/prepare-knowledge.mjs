import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const original = join(root, "knowledge/original");
const manifest = JSON.parse(readFileSync(join(root, "knowledge/manifest.json"), "utf8"));
const hash = (data) => createHash("sha256").update(data).digest("hex");
const attr = (node, key) => node.attrs?.find((a) => a.name === key)?.value;
const descendants = (node) => [node, ...(node.childNodes || []).flatMap(descendants)];
const text = (node) =>
  ["script", "style"].includes(node.tagName)
    ? ""
    : node.nodeName === "#text"
      ? node.value
      : (node.childNodes || []).map(text).join(" ");
const plain = (node) => text(node).replace(/\s+/g, " ").trim();
const save = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
};

const documents = [],
  sources = new Map();
function registerSource(url, title, documentId, datasetId, metadata) {
  if (
    !/^https?:\/\//.test(url) ||
    /^(?:www\.)?(?:x\.com|vocpartij\.nl)$/.test(new URL(url).hostname)
  )
    return;
  if (!sources.has(url))
    sources.set(url, {
      id: hash(url).slice(0, 16),
      url,
      title: title || url,
      documentIds: [],
      datasetIds: [],
      metadata: [],
    });
  const source = sources.get(url);
  if (documentId && !source.documentIds.includes(documentId)) source.documentIds.push(documentId);
  if (datasetId && !source.datasetIds.includes(datasetId)) source.datasetIds.push(datasetId);
  if (metadata && !source.metadata.some((m) => JSON.stringify(m) === JSON.stringify(metadata)))
    source.metadata.push(metadata);
}

const categories = {
  index: "AI-experiment",
  mensen: "Politieke uitgangspunten",
  bondgenoten: "Politieke uitgangspunten",
  geschiedenis: "Historisch dossier",
  ideeenplein: "Politieke voorstellen",
  laboratorium: "Fictief rekenmodel",
  nieuws: "Documentenregister",
  feiten: "VOC-analyse",
  financien: "Onderzoeksdossier",
  kennis: "Onderzoeksdossier",
  bestuur: "Onderzoeksdossier",
};

for (const entry of manifest.files) {
  if (
    !/^(?:[a-z-]+\.html|(?:assets|css|js|data)\/[A-Za-z0-9_.-]+\.(?:svg|png|css|js|json))$/.test(
      entry.path,
    )
  )
    throw new Error("Unexpected original path");
  const bytes = readFileSync(join(original, entry.path));
  if (bytes.length !== entry.bytes || hash(bytes) !== entry.sha256)
    throw new Error(`Original changed: ${entry.path}`);
  const output = entry.path === "index.html" ? "over-voc.html" : entry.path;
  const destination = join(root, "public", output);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(original, entry.path), destination);
  if (!entry.path.endsWith(".html")) continue;
  const nodes = descendants(parse(bytes.toString("utf8")));
  const main = nodes.find((n) => n.tagName === "main");
  const mainNodes = descendants(main);
  const id = entry.path.replace(".html", "");
  const title = plain(mainNodes.find((n) => n.tagName === "h1"));
  const document = {
    id,
    path: output,
    originalPath: entry.path,
    sha256: entry.sha256,
    title,
    category: categories[id],
    checkedAt: attr(mainNodes.find((n) => n.tagName === "time") || {}, "datetime") || null,
    publishedAt: null,
    anchors: nodes.map((n) => attr(n, "id")).filter(Boolean),
    headings: mainNodes
      .filter((n) => ["h2", "h3"].includes(n.tagName))
      .map((n) => ({ title: plain(n), anchor: attr(n, "id") || null })),
    text: plain(main),
  };
  documents.push(document);
  for (const node of nodes.filter((n) => n.tagName === "a"))
    registerSource(attr(node, "href") || "", plain(node), id);
}

const stats = JSON.parse(readFileSync(join(original, "data/statistieken.json"), "utf8"));
const registered = new Map();
for (const [id, dataset] of Object.entries(stats.datasets)) {
  if (!dataset.bron?.url) throw new Error(`Missing dataset provenance: ${id}`);
  registerSource(dataset.bron.url, dataset.bron.titel || dataset.bron.naam, null, id, dataset.bron);
  for (const file of dataset.bronbestanden || []) {
    if (!registered.has(file))
      registered.set(file, { path: file, datasetIds: [], availableInPublicSnapshot: false });
    registered.get(file).datasetIds.push(id);
  }
}

const catalog = {
  schemaVersion: 1,
  provenance: {
    exportRetrievedAt: manifest.retrievedAt,
    datasetRetrievedAt: stats.opgehaald,
    source: "Bestaande publieke VOC-website",
    rawArchiveIncluded: false,
  },
  documents,
  sources: [...sources.values()].sort((a, b) => a.url.localeCompare(b.url)),
  registeredSourceFiles: [...registered.values()].sort((a, b) => a.path.localeCompare(b.path)),
  homeCompatibilityAnchors: documents
    .find((d) => d.id === "index")
    .anchors.filter((id) => !["inhoud", "hoofdmenu"].includes(id)),
};
const json = JSON.stringify(catalog, null, 2) + "\n";
save(join(root, "knowledge/generated/catalog.json"), json);
save(
  join(root, "knowledge/generated/home-anchors.json"),
  JSON.stringify(catalog.homeCompatibilityAnchors) + "\n",
);
save(join(root, "public/data/knowledge-catalog.json"), json);

// Copy the pure functions verbatim, excluding the legacy DOM integration.
const model = readFileSync(join(original, "js/laboratorium.js"), "utf8");
const start = model.indexOf("  function eenheden("),
  end = model.indexOf("  if (typeof module", start);
if (start < 0 || end < start)
  throw new Error("Original model structure changed; manual review required");
save(
  join(root, "src/knowledge/tax-engine.js"),
  `// Generated verbatim from the verified original model; do not edit.\n${model.slice(start, end)}\nexport { bereken };\n`,
);
console.log(
  `Knowledge prepared: ${documents.length} documents, ${Object.keys(stats.datasets).length} datasets, ${catalog.sources.length} source URLs, ${registered.size} registered source-file references.`,
);
