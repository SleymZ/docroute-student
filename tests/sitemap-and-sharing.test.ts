import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import sitemap from "@/app/sitemap";
import catalog from "@/data/universities.json";
import { verifiedPrograms } from "@/data/verified-programs";
import { indexableUniversityIds } from "@/lib/indexable-universities";

const root = process.env.REPO_ROOT ?? process.cwd();

test("the sitemap lists Top 100 and the university pages that have facts", () => {
  const urls = sitemap().map((entry) => new URL(entry.url).pathname);
  assert.ok(urls.includes("/explore/top"));
  for (const program of verifiedPrograms) {
    assert.ok(urls.includes(`/universities/${program.universityId}`), program.universityId);
  }
  // Catalog-only pages (no verified, coming-soon or Top 100 facts) are left out.
  const universityUrls = urls.filter((url) => url.startsWith("/universities/"));
  assert.ok(universityUrls.length > 50 && universityUrls.length < catalog.universities.length / 4);
  assert.equal(new Set(urls).size, urls.length, "no duplicates");
  // Personal pages never go into the sitemap.
  assert.ok(urls.every((url) => !/^\/(route|account|auth|my-route|api)(\/|$)/.test(url)));
});

test("every indexable university id exists in the catalog", () => {
  const known = new Set(catalog.universities.map((university) => university.id));
  for (const id of indexableUniversityIds()) assert.ok(known.has(id), id);
});

test("links shared in chats get a large preview image with alt text", () => {
  for (const name of ["opengraph-image", "twitter-image"]) {
    const png = readFileSync(join(root, `src/app/${name}.png`));
    // PNG header: width and height (big-endian) at bytes 16 and 20.
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    assert.ok(png.length < 1_000_000);
    assert.match(readFileSync(join(root, `src/app/${name}.alt.txt`), "utf8"), /DocRoute/);
  }
  assert.match(readFileSync(join(root, "src/app/layout.tsx"), "utf8"), /card: "summary_large_image"/);
  assert.ok(statSync(join(root, "src/app/favicon.ico")).size > 0);
});
