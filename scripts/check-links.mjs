#!/usr/bin/env node
// Checks every official link in the route and university data (src/data,
// src/lib). Run on GitHub Actions (the cloud workspace has no internet):
// see .github/workflows/check-links.yml. Writes a Markdown report to
// link-report.md and the raw results to link-report.json. Never fails the
// build: a site that is down for an hour is not a broken route.
//
// "Broken" means 404/410, a DNS or TLS error, or a redirect to a page whose
// address looks like a "not found" page. 401/403/429 and timeouts are
// "blocked": many government sites refuse automated requests, so those
// need a look in a normal browser, not a fix.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const roots = ["src/data", "src/lib"];
const urlPattern = /https?:\/\/[^\s"'`<>()\\]+/g;

export function extractUrls(text) {
  const found = new Set();
  for (const match of text.matchAll(urlPattern)) {
    let url = match[0].replace(/[.,;:]+$/, "");
    if (url.includes("${")) continue; // template, not a real address
    if (/localhost|example\.(com|org)|your-project/.test(url)) continue;
    found.add(url);
  }
  return found;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (/\.(ts|tsx|json)$/.test(name) && !name.endsWith("universities.json")) files.push(path);
  }
  return files;
}

export function classify(status, finalUrl, error) {
  if (error) return /timeout|abort|ECONNRESET|UND_ERR_SOCKET/i.test(error) ? "blocked" : "broken";
  if (status === 404 || status === 410) return "broken";
  if (status >= 200 && status < 400) {
    return /\/(404|not-?found|error)(\b|\/|\.)|[?&]error=404/i.test(finalUrl ?? "") ? "broken" : "ok";
  }
  if ([401, 403, 405, 406, 429, 503].includes(status)) return "blocked";
  return status >= 500 ? "blocked" : "broken";
}

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 DocRouteLinkCheck",
        accept: "text/html,application/pdf;q=0.9,*/*;q=0.8",
        "accept-language": "en,de;q=0.8,sk;q=0.7,cs;q=0.6",
      },
    });
    await response.body?.cancel().catch(() => {});
    return { url, status: response.status, finalUrl: response.url, result: classify(response.status, response.url) };
  } catch (error) {
    const message = String(error?.cause?.code ?? error?.name ?? error);
    return { url, status: 0, error: message, result: classify(0, null, message) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const sources = new Map();
  for (const root of roots) {
    for (const file of walk(root)) {
      for (const url of extractUrls(readFileSync(file, "utf8"))) {
        if (!sources.has(url)) sources.set(url, new Set());
        sources.get(url).add(file);
      }
    }
  }
  const urls = [...sources.keys()].sort();
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 12 }, async () => {
      while (next < urls.length) {
        const url = urls[next++];
        results.push({ ...(await check(url)), files: [...sources.get(url)] });
      }
    }),
  );
  results.sort((a, b) => a.url.localeCompare(b.url));
  const count = (kind) => results.filter((item) => item.result === kind).length;
  const lines = [
    "## Official link check",
    "",
    `Checked ${results.length} links: ${count("ok")} ok, ${count("broken")} broken, ${count("blocked")} blocked or slow (open by hand).`,
    "",
  ];
  for (const kind of ["broken", "blocked"]) {
    const list = results.filter((item) => item.result === kind);
    if (!list.length) continue;
    lines.push(`### ${kind === "broken" ? "Broken" : "Blocked or slow"} (${list.length})`, "");
    for (const item of list.slice(0, 150)) {
      const where = item.files.map((file) => file.replace(/^src\//, "")).join(", ");
      const detail = item.error ?? `${item.status}${item.finalUrl && item.finalUrl !== item.url ? ` → ${item.finalUrl}` : ""}`;
      lines.push(`- ${item.url} — ${detail} (${where})`);
    }
    lines.push("");
  }
  writeFileSync("link-report.md", lines.join("\n"));
  writeFileSync("link-report.json", JSON.stringify(results, null, 1));
  console.log(lines.slice(0, 3).join("\n"));
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
