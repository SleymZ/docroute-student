import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  buildWaitlistInsert,
  isValidEmail,
  normalizeEmail,
  WAITLIST_CONSENT_VERSION,
  waitlistOutcome,
  waitlistRoutes,
} from "../src/lib/waitlist";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const sql = read("supabase/migrations/20261028180000_waitlist.sql");

test("emails are trimmed, lower-cased and checked", () => {
  assert.equal(normalizeEmail("  Ana@Example.SK "), "ana@example.sk");
  assert.ok(isValidEmail("ana@example.sk"));
  assert.ok(isValidEmail(" Ana@Example.SK "));
  for (const bad of ["", "ana", "ana@", "ana@example", "a na@example.sk", "@example.sk"]) {
    assert.ok(!isValidEmail(bad), bad);
  }
  assert.ok(!isValidEmail(`${"a".repeat(250)}@x.sk`));
});

test("a signup stores only email, route and consent version", () => {
  assert.deepEqual(buildWaitlistInsert(" Ana@Example.SK", "work-sk"), {
    email: "ana@example.sk",
    route: "work-sk",
    consent_version: WAITLIST_CONSENT_VERSION,
  });
  assert.match(WAITLIST_CONSENT_VERSION, /^\d{4}-\d{2}-\d{2}$/);
});

test("a repeated signup looks the same as a new one", () => {
  assert.equal(waitlistOutcome(null), "joined");
  assert.equal(waitlistOutcome({ code: "23505" }), "joined");
  assert.equal(waitlistOutcome({ code: "42501" }), "failed");
});

test("the database allows the same routes as the site", () => {
  const listed = sql.match(/route in \(([^)]+)\)/)?.[1] ?? "";
  const dbRoutes = [...listed.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual([...dbRoutes].sort(), [...waitlistRoutes].sort());
});

test("visitors can only add to the waitlist, never read it", () => {
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table public\.waitlist_signups from public, anon, authenticated/);
  assert.match(sql, /grant insert \(email, route, consent_version\) on table public\.waitlist_signups to anon, authenticated/);
  assert.match(sql, /for insert\s+to anon, authenticated/);
  assert.doesNotMatch(sql, /grant (select|update|delete)[^;]*waitlist_signups/);
  assert.doesNotMatch(sql, /for (select|update|delete|all)/);
});

test("leaving the waitlist and deleting an account remove the email", () => {
  assert.match(sql, /function public\.leave_waitlist\(p_email text\)\s+returns void/);
  assert.match(sql, /grant execute on function public\.leave_waitlist\(text\) to anon, authenticated/);
  assert.match(sql, /delete from public\.waitlist_signups where email = current_email/);
  assert.match(sql, /set search_path = ''/);
  assert.match(sql, /revoke all on function public\.delete_my_account\(\) from anon/);
});

test("the consent box is unticked and links to the privacy policy", () => {
  const cta = read("src/components/WaitlistCta.tsx");
  assert.match(cta, /useState\(false\)/);
  assert.match(cta, /type="checkbox"/);
  assert.match(cta, /href="\/privacy#waitlist"/);
  assert.doesNotMatch(cta, /localStorage/);
});

test("every route page offers the waitlist", () => {
  for (const screen of ["RoutePreviewScreen", "WorkRouteScreen", "CzechiaRouteScreen"]) {
    assert.match(read(`src/components/${screen}.tsx`), /<WaitlistCta route=/, screen);
  }
});

test("the privacy policy explains the waitlist and how to leave it", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /Art\. 6\(1\)\(a\)/);
  assert.match(privacy, /id="waitlist"/);
  assert.match(privacy, /<WaitlistLeave \/>/);
  assert.match(privacy, /WAITLIST_MAX_MONTHS/);
});
