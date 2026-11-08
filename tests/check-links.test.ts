import assert from "node:assert/strict";
import { test } from "node:test";

// @ts-expect-error plain JavaScript script without types
import { classify, extractUrls } from "../scripts/check-links.mjs";

test("the link check finds real addresses and skips templates and examples", () => {
  const found: Set<string> = extractUrls(
    'url: "https://ipc.gov.cz/en/a/", note: "see https://mic.iom.sk/en/x.html.", t: `https://home-affairs.ec.europa.eu/${path}_en`, e: "https://your-project.supabase.co"',
  );
  assert.deepEqual([...found], ["https://ipc.gov.cz/en/a/", "https://mic.iom.sk/en/x.html"]);
});

test("the link check separates broken links from sites that refuse robots", () => {
  assert.equal(classify(200, "https://example.eu/page"), "ok");
  assert.equal(classify(404, "https://example.eu/page"), "broken");
  assert.equal(classify(200, "https://example.eu/404.html"), "broken");
  assert.equal(classify(0, null, "ENOTFOUND"), "broken");
  assert.equal(classify(403, "https://example.eu/page"), "blocked");
  assert.equal(classify(0, null, "AbortError"), "blocked");
});
