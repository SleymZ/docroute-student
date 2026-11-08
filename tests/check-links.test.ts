import assert from "node:assert/strict";
import { test } from "node:test";

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

test("the link check keeps parentheses that belong to the address", () => {
  const found: Set<string> = extractUrls(
    '"https://www.uni-goettingen.de/en/application+and+enrolment+(for+eu+and+non-eu+applicants)/46792.html" (see https://ipc.gov.cz/en/b/)',
  );
  assert.deepEqual([...found], [
    "https://www.uni-goettingen.de/en/application+and+enrolment+(for+eu+and+non-eu+applicants)/46792.html",
    "https://ipc.gov.cz/en/b/",
  ]);
});

test("a law number in the path is not a 'not found' page; .invalid addresses are skipped", () => {
  assert.equal(classify(200, "https://static.slov-lex.sk/static/SK/ZZ/2011/404/20260715.html"), "ok");
  assert.equal(classify(200, "https://example.eu/page-not-found/"), "broken");
  assert.equal(extractUrls("https://docroute.invalid/route").size, 0);
});

test("links built by helpers are found in the loaded data", async () => {
  const { collectUrls } = await import("../scripts/check-links.mjs");
  const { euPortalSource } = await import("@/data/eu-immigration-portal");
  const found: Set<string> = collectUrls({ sources: [euPortalSource("eu-blue-card", "FR")] });
  assert.equal(found.size, 1);
  assert.match([...found][0], /^https:\/\/home-affairs\.ec\.europa\.eu\/.+_en$/);
});

test("a URL prefix kept in a constant is not checked as a link; a timeout is 'blocked'", () => {
  const found: Set<string> = extractUrls('const MIIG_PDF = "https://www.make-it-in-germany.com/fileadmin/Visagrafik_EN/";\nconst url = `${MIIG_PDF}Visum_EN.pdf`;');
  assert.equal(found.size, 0);
  assert.equal(classify(0, null, "ETIMEDOUT"), "blocked");
});
