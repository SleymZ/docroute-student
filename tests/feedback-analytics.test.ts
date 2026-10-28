import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { prepareAnalyticsEvent, stripQuery } from "../src/lib/analytics";
import { buildFeedbackInsert, feedbackPage } from "../src/lib/feedback";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("feedback keeps only the path, a valid rating and trimmed text", () => {
  assert.equal(feedbackPage("/route/work?citizenship=UA&move=2027-01-01"), "/route/work");
  assert.equal(feedbackPage("route#x"), "/route");
  assert.deepEqual(
    buildFeedbackInsert({ pathname: "/route/work?citizenship=UA", route: "work-sk", rating: 4, message: "  ok  " }),
    { page: "/route/work", route: "work-sk", rating: 4, message: "ok" },
  );
  assert.equal(buildFeedbackInsert({ pathname: "/", rating: null, message: "   " }), null);
  assert.equal(buildFeedbackInsert({ pathname: "/", rating: 7, message: "" }), null);
  assert.equal(buildFeedbackInsert({ pathname: "/", message: "x".repeat(2001) }), null);
  assert.equal(buildFeedbackInsert({ pathname: "/", route: "family-sk", rating: 2 })?.route, null);
});

test("feedback table is insert-only and rejects query strings", () => {
  const sql = read("supabase/migrations/20261028200000_feedback.sql");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table public\.feedback from public, anon, authenticated/);
  assert.match(sql, /grant insert \(page, route, rating, message\) on table public\.feedback to anon, authenticated/);
  assert.doesNotMatch(sql, /for (select|update|delete|all)/);
  assert.match(sql, /position\('\?' in page\) = 0/);
});

test("analytics events never carry route answers and stop without consent", () => {
  assert.equal(stripQuery("https://x.app/route/work?citizenship=UA#a"), "https://x.app/route/work");
  assert.deepEqual(prepareAnalyticsEvent({ url: "/route/czechia?purpose=study" }, true), { url: "/route/czechia" });
  assert.equal(prepareAnalyticsEvent({ url: "/" }, false), null);
});

test("statistics load only after Accept all, in production", () => {
  const loader = read("src/components/ConsentedAnalytics.tsx");
  assert.match(loader, /if \(hasOptionalConsent\(\)\) load\(\)/);
  assert.match(loader, /prepareAnalyticsEvent\(event, hasOptionalConsent\(\)\)/);
  assert.match(loader, /NEXT_PUBLIC_VERCEL_ENV !== "production"/);
  assert.match(read("src/app/layout.tsx"), /<ConsentedAnalytics \/>/);
  assert.match(read("src/app/cookies/page.tsx"), /Vercel\s+Web Analytics/);
  assert.match(read("src/app/privacy/page.tsx"), /Visit statistics, only if you choose/);
});

test("every route page asks for feedback", () => {
  for (const screen of ["RoutePreviewScreen", "WorkRouteScreen", "CzechiaRouteScreen"]) {
    assert.match(read(`src/components/${screen}.tsx`), /<FeedbackForm route=/, screen);
  }
  assert.match(read("src/components/SiteFooter.tsx"), /href="\/feedback"/);
});
