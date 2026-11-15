import { execFileSync } from "node:child_process";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Heuristics, not proof that arbitrary content is free of confidential data.
export function sensitiveMarkers(text) {
  const patterns = {
    private_key: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    github_token: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/,
    aws_access_key: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    google_api_key: /\bAIza[A-Za-z0-9_-]{35}\b/,
    ai_api_key: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/,
    assigned_secret:
      /(?:api[_-]?key|password|secret|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9+/=_-]{16,}["']/i,
    credentials_in_url: /https?:\/\/[^/\s:@]+:[^/@\s]+@/,
  };
  return Object.entries(patterns)
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name);
}

export function checkApproval(env) {
  if (
    env.GITHUB_EVENT_NAME !== "workflow_dispatch" ||
    env.GITHUB_REPOSITORY !== "wiard/voc-frontend" ||
    env.GITHUB_REF !== "refs/heads/main" ||
    env.VOC_PAGES_ENABLED !== "true" ||
    env.PUBLICATION_CONFIRMATION !== "PUBLISH VOC PUBLICLY" ||
    !/^[a-f0-9]{40}$/.test(env.APPROVED_COMMIT || "") ||
    env.APPROVED_COMMIT !== env.GITHUB_SHA
  ) {
    throw new Error("Publication denied: explicit approval of this main commit is required.");
  }
}

export function checkSources(root = process.cwd()) {
  const paths = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean);
  const issues = [];
  for (const path of new Set(paths)) {
    if (/(^|\/)\.env(?:\.|$)|\.(?:pem|key|p12|sqlite|db)$|(^|\/)\.npmrc$/.test(path))
      issues.push(`${path}: sensitive filename`);
    const absolute = join(root, path);
    if (lstatSync(absolute).isSymbolicLink()) {
      issues.push(`${path}: symbolic link`);
      continue;
    }
    if (/\.(?:png|jpg|jpeg|webp|ico|woff2?)$/i.test(path)) continue;
    for (const marker of sensitiveMarkers(readFileSync(absolute, "utf8")))
      issues.push(`${path}: ${marker}`);
  }
  if (issues.length) throw new Error(issues.join("\n"));
  return paths.length;
}

export function checkDist(root = resolve("dist"), base = process.env.VOC_BASE_PATH || "/") {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base)) throw new Error("Invalid public base path");
  const files = [];
  function visit(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry),
        path = relative(root, full).replaceAll("\\", "/"),
        stat = lstatSync(full);
      if (stat.isSymbolicLink()) throw new Error("Artifact contains a symbolic link");
      if (entry.startsWith(".")) throw new Error("Artifact contains hidden files");
      if (stat.isDirectory()) {
        visit(full);
        continue;
      }
      // Explicit scope for phase 2A; extend deliberately when knowledge is approved.
      if (
        !/^(?:index\.html|favicon\.png|assets\/[A-Za-z0-9_.\/-]+\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?))$/.test(
          path,
        )
      ) {
        throw new Error(`Unapproved public file: ${path}`);
      }
      if (
        !/\.(?:png|jpg|jpeg|webp|woff2?)$/.test(path) &&
        sensitiveMarkers(readFileSync(full, "utf8")).length
      ) {
        throw new Error(`Possible secret in public artifact: ${path}`);
      }
      files.push(path);
    }
  }
  visit(root);
  const html = readFileSync(join(root, "index.html"), "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url = match[1];
    if (!url.startsWith(base) || !files.includes(url.slice(base.length)))
      throw new Error(`Invalid built asset reference: ${url}`);
  }
  if (
    !files.includes("favicon.png") ||
    !files.some((p) => p.endsWith(".js")) ||
    !files.some((p) => p.endsWith(".css"))
  )
    throw new Error("Incomplete build artifact");
  return files;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === "--sources")
      console.log(
        `Source checks passed (${checkSources()} files; no matched secret values printed).`,
      );
    else if (process.argv[2] === "--dist")
      console.log(`Artifact checks passed: ${checkDist().join(", ")}`);
    else if (process.argv[2] === "--approval") {
      checkApproval(process.env);
      console.log("Exact commit approval verified.");
    } else throw new Error("Choose --sources, --dist or --approval");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
