import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import universities from "../src/data/universities.json";
import { universityCountryCodes } from "../src/data/university-countries";
import { canUse, FREE_STEPS_PER_STAGE, limitTasks, needsAccount, signUpHref, tierFromPlan } from "../src/lib/access";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("guests browse; free builds a short route; plus gets everything", () => {
  assert.equal(canUse("guest", "browse"), true);
  assert.equal(canUse("guest", "buildRoute"), false);
  assert.equal(canUse("free", "buildRoute"), true);
  for (const feature of ["fullChecklist", "dates", "saveMyRoute", "exportFiles", "emailReminders"] as const) {
    assert.equal(canUse("free", feature), false, feature);
    assert.equal(canUse("plus", feature), true, feature);
  }
});

test("the Free plan shows the first steps of a stage and counts the rest", () => {
  const tasks = [1, 2, 3, 4, 5];
  assert.deepEqual(limitTasks(tasks, "free"), { shown: tasks.slice(0, FREE_STEPS_PER_STAGE), hidden: 5 - FREE_STEPS_PER_STAGE });
  assert.deepEqual(limitTasks(tasks, "plus"), { shown: tasks, hidden: 0 });
  assert.deepEqual(limitTasks([1], "free"), { shown: [1], hidden: 0 });
});

test("Plus needs a plus row that has not ended", () => {
  const now = new Date("2026-11-05T12:00:00Z");
  assert.equal(tierFromPlan(null, now), "free");
  assert.equal(tierFromPlan({ plan: "free", plus_until: null }, now), "free");
  assert.equal(tierFromPlan({ plan: "plus", plus_until: null }, now), "plus");
  assert.equal(tierFromPlan({ plan: "plus", plus_until: "2026-12-01T00:00:00Z" }, now), "plus");
  assert.equal(tierFromPlan({ plan: "plus", plus_until: "2026-11-01T00:00:00Z" }, now), "free");
});

test("every route asks a guest to sign up first; browsing stays public", () => {
  for (const path of ["/route/work", "/route/preview", "/route/full", "/explore/profile", "/my-route", "/stories/new"]) {
    assert.equal(needsAccount(path), true, path);
  }
  for (const path of ["/", "/home", "/explore", "/explore/top", "/explore/universities", "/universities/x", "/stories", "/stories/abc", "/plus", "/routes-guide"]) {
    assert.equal(needsAccount(path), false, path);
  }
  assert.equal(signUpHref("/route/work?citizenship=UA"), "/auth?mode=signup&next=%2Froute%2Fwork%3Fcitizenship%3DUA");
  const proxy = read("src/proxy.ts");
  assert.match(proxy, /signedIn === false && needsAccount\(/);
  assert.match(proxy, /signUpHref\(/);
});

test("route screens shorten the checklist and lock dates and files on Free", () => {
  for (const screen of ["WorkRouteScreen", "CzechiaRouteScreen", "PurposeRouteScreen", "RoutePreviewScreen"]) {
    const source = read(`src/components/${screen}.tsx`);
    assert.match(source, /useAccess\(\)/, screen);
    assert.match(source, /limitTasks\(stage\.tasks, access\.tier\)\.shown/, screen);
    assert.match(source, /<PlusMoreSteps /, screen);
    assert.match(source, /<PlusFeature feature="dates" \/>/, screen);
    assert.match(source, /access\.plus && isIsoDate\(rawMoveDate\)/, screen);
  }
  for (const screen of ["FullPathScreen", "CountryGuideScreen"]) {
    const source = read(`src/components/${screen}.tsx`);
    assert.match(source, /limitTasks\(stage\.tasks, access\.tier\)\.shown/, screen);
  }
  assert.match(read("src/components/SaveRoutePdf.tsx"), /if \(!access\.plus\)/);
  assert.match(read("src/components/ConfirmRoute.tsx"), /<PlusFeature feature="save" \/>/);
});

test("saving to My route is Plus-only in the database too", () => {
  const sql = read("supabase/migrations/20261105120000_account_plans.sql");
  assert.match(sql, /alter table public\.account_plans enable row level security/);
  assert.match(sql, /grant select on table public\.account_plans to authenticated/);
  assert.doesNotMatch(sql, /grant (insert|update)[^;]*account_plans/);
  assert.match(sql, /with check \(\(select auth\.uid\(\)\) = user_id and \(select public\.has_plus\(\)\)\)/);
});

test("the map links to every country that has universities", () => {
  const codes = new Set((universities as { universities: { countryCode: string }[] }).universities.map((u) => u.countryCode));
  const mapSource = read("src/lib/europe-map.ts");
  const onMap = [...mapSource.matchAll(/"\d{3}": "([A-Z]{2})"/g)].map((m) => m[1]);
  const expected = onMap.filter((code) => codes.has(code)).sort();
  assert.deepEqual([...universityCountryCodes].sort(), expected);
  assert.ok(universityCountryCodes.has("SK") && universityCountryCodes.has("DE"));
});
