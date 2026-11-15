import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { checkApproval, checkDist, sensitiveMarkers } from "../scripts/publication-checks.mjs";

const checkTestDist = (root, base = "/") => checkDist(root, base, { knowledgeManifest: [] });

const read = (path) => parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const build = read(".github/workflows/build.yml");
const pages = read(".github/workflow-templates/pages-publish.yml.disabled");
const customPages = read(".github/workflows/pages-test.yml");
const good = {
  GITHUB_EVENT_NAME: "workflow_dispatch",
  GITHUB_REPOSITORY: "wiard/voc-frontend",
  GITHUB_REF: "refs/heads/main",
  VOC_PAGES_ENABLED: "true",
  PUBLICATION_CONFIRMATION: "PUBLISH VOC PUBLICLY",
  GITHUB_SHA: "a".repeat(40),
  APPROVED_COMMIT: "a".repeat(40),
};

test("prepared custom-domain workflow preserves the approved source and rejects the old target", () => {
  assert.deepEqual(customPages.on.push.branches, ["codex/voc-pages-test"]);
  assert.deepEqual(customPages.on.push.paths, [".github/workflows/pages-test.yml"]);
  assert.equal(customPages.jobs.build.env.VOC_BASE_PATH, "/");
  assert.equal(
    customPages.jobs.build.env.APPROVED_SOURCE,
    "4ab8e46493b438d2db42335f266db987f28708a6",
  );
  const checkout = customPages.jobs.build.steps.find((step) =>
    step.uses?.startsWith("actions/checkout@"),
  );
  assert.equal(checkout.with.ref, customPages.jobs.build.env.APPROVED_SOURCE);
  const guard = customPages.jobs.build.steps.find(
    (step) => step.name === "Verify custom domain and root path",
  );
  assert.ok(guard);
  for (const [host, path, accepted] of [
    ["nieuw.vocpartij.nl", "", true],
    ["wiard.github.io", "/voc-frontend", false],
    ["nieuw.vocpartij.nl", "/voc-frontend", false],
    ["vocpartij.nl", "", false],
    ["www.vocpartij.nl", "", false],
    ["", "", false],
  ]) {
    const result = spawnSync("/bin/sh", ["-ec", guard.run], {
      env: { PAGES_HOST: host, PAGES_BASE: path },
    });
    assert.equal(result.status === 0, accepted, `${host}${path}`);
  }
});

test("public browser configuration accepts both test domains and refuses production", () => {
  for (const [url, accepted] of [
    ["https://wiard.github.io/voc-frontend/", true],
    ["https://nieuw.vocpartij.nl/", true],
    ["https://vocpartij.nl/", false],
    ["https://www.vocpartij.nl/", false],
    ["http://nieuw.vocpartij.nl/", false],
  ]) {
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", "await import('./playwright.public.config.mjs')"],
      {
        cwd: new URL("..", import.meta.url),
        env: { ...process.env, VOC_PUBLIC_BASE_URL: url },
        encoding: "utf8",
      },
    );
    assert.equal(result.status === 0, accepted, url);
  }
});

test("automatic build has no publication permissions or deploy action", () => {
  assert.deepEqual(build.permissions, { contents: "read" });
  assert.deepEqual(Object.keys(build.on).sort(), ["pull_request", "push", "workflow_dispatch"]);
  assert.ok(!JSON.stringify(build).includes("deploy-pages"));
  for (const job of Object.values(build.jobs))
    assert.ok(!job.permissions || Object.values(job.permissions).every((v) => v === "read"));
  const upload = build.jobs.build.steps.find((s) => s.uses?.startsWith("actions/upload-artifact@"));
  assert.equal(upload.with.path, "dist/");
  assert.equal(upload.with["include-hidden-files"], false);
  assert.equal(build.jobs.build["timeout-minutes"], 15);
});

test("all executable workflows and the inactive template parse, pin actions and disable saved credentials", () => {
  const workflows = readdirSync(new URL("../.github/workflows/", import.meta.url)).filter((p) =>
    /\.ya?ml$/.test(p),
  );
  for (const workflow of [...workflows.map((p) => read(`.github/workflows/${p}`)), pages]) {
    for (const job of Object.values(workflow.jobs)) {
      for (const step of job.steps) {
        if (step.uses)
          assert.match(step.uses, /^(?:actions\/[a-z-]+|pnpm\/action-setup)@[a-f0-9]{40}$/);
        if (step.uses?.startsWith("actions/checkout@"))
          assert.equal(step.with["persist-credentials"], false);
      }
    }
  }
});

test("publication template is manual, main-only, gated and tests before publication", () => {
  assert.deepEqual(Object.keys(pages.on), ["workflow_dispatch"]);
  for (const guard of [
    "github.repository == 'wiard/voc-frontend'",
    "github.ref == 'refs/heads/main'",
    "vars.VOC_PAGES_ENABLED == 'true'",
    "inputs.confirmation == 'PUBLISH VOC PUBLICLY'",
  ]) {
    assert.ok(pages.jobs.build.if.includes(guard));
  }
  assert.equal(pages.jobs.deploy.needs, "build");
  assert.equal(pages.jobs.deploy.environment.name, "github-pages");
  assert.deepEqual(pages.jobs.deploy.permissions, {
    contents: "read",
    pages: "write",
    "id-token": "write",
  });
  assert.equal(pages.jobs.deploy.steps.length, 1);
  const steps = pages.jobs.build.steps;
  const approval = steps.findIndex((s) => s.run?.includes("--approval"));
  const configuration = steps.findIndex((s) => s.uses?.startsWith("actions/configure-pages@"));
  assert.ok(approval >= 0 && configuration > approval);
  assert.equal(steps[configuration].with.enablement, false);
  assert.equal(
    steps.find((s) => s.uses?.startsWith("actions/upload-pages-artifact@")).with.path,
    "dist/",
  );
  assert.ok(steps.some((s) => s.run?.includes("pnpm test\n")));
});

test("publication accepts exactly the approved main commit", () => checkApproval(good));
for (const [key, value] of Object.entries({
  GITHUB_EVENT_NAME: "push",
  GITHUB_REPOSITORY: "other/repo",
  GITHUB_REF: "refs/heads/codex/github-publishing",
  VOC_PAGES_ENABLED: "false",
  PUBLICATION_CONFIRMATION: "",
  GITHUB_SHA: "b".repeat(40),
  APPROVED_COMMIT: "main",
})) {
  test(`publication fails closed for ${key}`, () =>
    assert.throws(() => checkApproval({ ...good, [key]: value }), /denied/));
}

test("secret detector recognizes synthetic credentials without printing values", () => {
  for (const text of [
    "gh" + "p_" + "A".repeat(36),
    "-----BEGIN " + "PRIVATE KEY-----",
    "AK" + "IA" + "A".repeat(16),
    "api_key = '" + "a".repeat(30) + "'",
  ]) {
    assert.ok(sensitiveMarkers(text).length);
  }
  assert.deepEqual(sensitiveMarkers("Demo: aanmelden is nog niet mogelijk."), []);
});

test("artifact rejects internal files, source maps, hidden files, links and credential text", () => {
  const dir = mkdtempSync(join(tmpdir(), "voc-artifact-test-"));
  try {
    mkdirSync(join(dir, "assets"));
    writeFileSync(
      join(dir, "index.html"),
      '<script src="/assets/app.js"></script><link href="/assets/app.css">',
    );
    writeFileSync(join(dir, "assets/app.js"), "console.log('VOC');");
    writeFileSync(join(dir, "assets/app.css"), "body {color: navy}");
    writeFileSync(join(dir, "favicon.png"), "synthetic image");
    assert.equal(checkTestDist(dir).length, 4);
    for (const file of [".env", "README.md", "package.json", "assets/code.js.map"]) {
      writeFileSync(join(dir, file), "private");
      assert.throws(() => checkTestDist(dir), /hidden|Unapproved/);
      rmSync(join(dir, file));
    }
    rmSync(join(dir, "favicon.png"));
    symlinkSync("/does-not-exist", join(dir, "favicon.png"));
    assert.throws(() => checkTestDist(dir), /symbolic link/);
    rmSync(join(dir, "favicon.png"));
    writeFileSync(join(dir, "index.html"), "gh" + "p_" + "A".repeat(36));
    assert.throws(() => checkTestDist(dir), /secret/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("artifact validates project-path asset links and rejects missing references", () => {
  const dir = mkdtempSync(join(tmpdir(), "voc-path-test-"));
  try {
    mkdirSync(join(dir, "assets"));
    writeFileSync(join(dir, "favicon.png"), "synthetic image");
    writeFileSync(join(dir, "assets/app.js"), "");
    writeFileSync(join(dir, "assets/app.css"), "");
    writeFileSync(
      join(dir, "index.html"),
      '<script src="/voc-frontend/assets/app.js"></script><link href="/voc-frontend/assets/app.css">',
    );
    assert.equal(checkTestDist(dir, "/voc-frontend/").length, 4);
    assert.throws(() => checkTestDist(dir, "/"), /Invalid built asset/);
    assert.throws(() => checkTestDist(dir, "//other.example/"), /Invalid public base/);
    rmSync(join(dir, "assets/app.js"));
    assert.throws(() => checkTestDist(dir, "/voc-frontend/"), /Invalid built asset/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
